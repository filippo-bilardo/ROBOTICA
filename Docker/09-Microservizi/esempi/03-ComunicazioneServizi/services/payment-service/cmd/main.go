package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/sirupsen/logrus"
	"github.com/streadway/amqp"
)

// Configuration
type Config struct {
	Port      string
	RedisURL  string
	RabbitURL string
	Debug     bool
}

// Payment represents a payment transaction
type Payment struct {
	ID       string    `json:"id"`
	OrderID  string    `json:"order_id"`
	UserID   int       `json:"user_id"`
	Amount   float64   `json:"amount"`
	Status   string    `json:"status"` // pending, processing, completed, failed
	Method   string    `json:"method"` // credit_card, paypal, bank_transfer
	Created  time.Time `json:"created"`
	Updated  time.Time `json:"updated"`
}

// PaymentRequest represents a payment request
type PaymentRequest struct {
	OrderID string  `json:"order_id" binding:"required"`
	UserID  int     `json:"user_id" binding:"required"`
	Amount  float64 `json:"amount" binding:"required,gt=0"`
	Method  string  `json:"method" binding:"required"`
}

// Event represents an event in the system
type Event struct {
	Type      string      `json:"type"`
	PaymentID string      `json:"payment_id,omitempty"`
	OrderID   string      `json:"order_id,omitempty"`
	UserID    string      `json:"user_id,omitempty"`
	Data      interface{} `json:"data"`
	Timestamp string      `json:"timestamp"`
	Service   string      `json:"service"`
}

// Service represents the payment service
type Service struct {
	config      *Config
	logger      *logrus.Logger
	redisClient *redis.Client
	rabbitConn  *amqp.Connection
	rabbitCh    *amqp.Channel
	payments    map[string]*Payment // In-memory storage for demo
	metrics     *Metrics
}

// Metrics for monitoring
type Metrics struct {
	PaymentsTotal     prometheus.Counter
	PaymentsByStatus  *prometheus.CounterVec
	PaymentDuration   prometheus.Histogram
	EventsPublished   prometheus.Counter
	EventsProcessed   prometheus.Counter
}

func NewMetrics() *Metrics {
	return &Metrics{
		PaymentsTotal: prometheus.NewCounter(prometheus.CounterOpts{
			Name: "payments_total",
			Help: "Total number of payment requests processed",
		}),
		PaymentsByStatus: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "payments_by_status_total",
				Help: "Total number of payments by status",
			},
			[]string{"status"},
		),
		PaymentDuration: prometheus.NewHistogram(prometheus.HistogramOpts{
			Name:    "payment_processing_duration_seconds",
			Help:    "Duration of payment processing",
			Buckets: prometheus.DefBuckets,
		}),
		EventsPublished: prometheus.NewCounter(prometheus.CounterOpts{
			Name: "events_published_total",
			Help: "Total number of events published",
		}),
		EventsProcessed: prometheus.NewCounter(prometheus.CounterOpts{
			Name: "events_processed_total",
			Help: "Total number of events processed",
		}),
	}
}

func (m *Metrics) Register() {
	prometheus.MustRegister(
		m.PaymentsTotal,
		m.PaymentsByStatus,
		m.PaymentDuration,
		m.EventsPublished,
		m.EventsProcessed,
	)
}

func NewService(config *Config) *Service {
	logger := logrus.New()
	if config.Debug {
		logger.SetLevel(logrus.DebugLevel)
	}

	logger.WithFields(logrus.Fields{
		"service": "payment-service",
		"version": "1.0.0",
	}).Info("Initializing payment service")

	metrics := NewMetrics()
	metrics.Register()

	return &Service{
		config:   config,
		logger:   logger,
		payments: make(map[string]*Payment),
		metrics:  metrics,
	}
}

func (s *Service) connectRedis() error {
	s.logger.Info("Connecting to Redis...")
	
	opt, err := redis.ParseURL(s.config.RedisURL)
	if err != nil {
		return fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	s.redisClient = redis.NewClient(opt)
	
	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := s.redisClient.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	s.logger.Info("✅ Connected to Redis")
	return nil
}

func (s *Service) connectRabbitMQ() error {
	s.logger.Info("Connecting to RabbitMQ...")
	
	var err error
	s.rabbitConn, err = amqp.Dial(s.config.RabbitURL)
	if err != nil {
		return fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	s.rabbitCh, err = s.rabbitConn.Channel()
	if err != nil {
		return fmt.Errorf("failed to open RabbitMQ channel: %w", err)
	}

	// Declare exchanges and queues
	if err := s.setupRabbitMQ(); err != nil {
		return fmt.Errorf("failed to setup RabbitMQ: %w", err)
	}

	s.logger.Info("✅ Connected to RabbitMQ")
	return nil
}

func (s *Service) setupRabbitMQ() error {
	// Declare exchange
	if err := s.rabbitCh.ExchangeDeclare(
		"payments",
		"topic",
		true,  // durable
		false, // auto-deleted
		false, // internal
		false, // no-wait
		nil,   // arguments
	); err != nil {
		return fmt.Errorf("failed to declare exchange: %w", err)
	}

	// Declare queue for order events
	_, err := s.rabbitCh.QueueDeclare(
		"payment.orders",
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	// Bind queue
	if err := s.rabbitCh.QueueBind(
		"payment.orders",
		"order.*",
		"orders",
		false,
		nil,
	); err != nil {
		return fmt.Errorf("failed to bind queue: %w", err)
	}

	return nil
}

func (s *Service) publishEvent(eventType string, paymentID, orderID string, data interface{}) error {
	event := Event{
		Type:      eventType,
		PaymentID: paymentID,
		OrderID:   orderID,
		Data:      data,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Service:   "payment-service",
	}

	// Publish to Redis streams
	if err := s.publishToRedis(event); err != nil {
		s.logger.WithError(err).Error("❌ Failed to publish event to Redis")
	}

	// Publish to RabbitMQ
	if err := s.publishToRabbitMQ(event); err != nil {
		s.logger.WithError(err).Error("❌ Failed to publish event to RabbitMQ")
	}

	s.metrics.EventsPublished.Inc()
	s.logger.WithFields(logrus.Fields{
		"event_type": eventType,
		"payment_id": paymentID,
		"order_id":   orderID,
	}).Info("📤 Event published")

	return nil
}

func (s *Service) publishToRedis(event Event) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	fields := map[string]interface{}{
		"type":       event.Type,
		"payment_id": event.PaymentID,
		"order_id":   event.OrderID,
		"data":       mustMarshal(event.Data),
		"timestamp":  event.Timestamp,
		"service":    event.Service,
	}

	if event.PaymentID != "" {
		// Get payment to add user_id
		if payment, exists := s.payments[event.PaymentID]; exists {
			fields["user_id"] = strconv.Itoa(payment.UserID)
		}
	}

	return s.redisClient.XAdd(ctx, &redis.XAddArgs{
		Stream: "events",
		Values: fields,
	}).Err()
}

func (s *Service) publishToRabbitMQ(event Event) error {
	body, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	routingKey := "payment." + event.Type
	
	return s.rabbitCh.Publish(
		"payments",
		routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			Body:         body,
			DeliveryMode: amqp.Persistent,
			Timestamp:    time.Now().UTC(),
		},
	)
}

func (s *Service) processPayment(payment *Payment) {
	start := time.Now()
	defer func() {
		s.metrics.PaymentDuration.Observe(time.Since(start).Seconds())
	}()

	s.logger.WithFields(logrus.Fields{
		"payment_id": payment.ID,
		"order_id":   payment.OrderID,
		"amount":     payment.Amount,
		"method":     payment.Method,
	}).Info("💳 Processing payment")

	// Simulate payment processing
	payment.Status = "processing"
	payment.Updated = time.Now().UTC()
	s.metrics.PaymentsByStatus.WithLabelValues("processing").Inc()

	// Publish processing event
	s.publishEvent("payment.processing", payment.ID, payment.OrderID, map[string]interface{}{
		"amount": payment.Amount,
		"method": payment.Method,
	})

	// Simulate processing time (1-3 seconds)
	processingTime := time.Duration(1000+rand.Intn(2000)) * time.Millisecond
	time.Sleep(processingTime)

	// Simulate payment success/failure (90% success rate)
	success := rand.Float32() < 0.9

	if success {
		payment.Status = "completed"
		s.metrics.PaymentsByStatus.WithLabelValues("completed").Inc()
		
		s.publishEvent("payment.completed", payment.ID, payment.OrderID, map[string]interface{}{
			"amount":        payment.Amount,
			"method":        payment.Method,
			"processed_at":  time.Now().UTC().Format(time.RFC3339),
		})
		
		s.logger.WithField("payment_id", payment.ID).Info("✅ Payment completed successfully")
	} else {
		payment.Status = "failed"
		s.metrics.PaymentsByStatus.WithLabelValues("failed").Inc()
		
		s.publishEvent("payment.failed", payment.ID, payment.OrderID, map[string]interface{}{
			"reason": "Insufficient funds or processing error",
			"amount": payment.Amount,
			"method": payment.Method,
		})
		
		s.logger.WithField("payment_id", payment.ID).Error("❌ Payment failed")
	}

	payment.Updated = time.Now().UTC()
}

func (s *Service) consumeEvents() {
	s.logger.Info("📥 Starting event consumer")

	// Consume from RabbitMQ
	go s.consumeFromRabbitMQ()
	
	// Consume from Redis (for demo - usually would pick one)
	go s.consumeFromRedis()
}

func (s *Service) consumeFromRabbitMQ() {
	msgs, err := s.rabbitCh.Consume(
		"payment.orders",
		"payment-consumer",
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		s.logger.WithError(err).Error("❌ Failed to start consuming from RabbitMQ")
		return
	}

	for msg := range msgs {
		var event Event
		if err := json.Unmarshal(msg.Body, &event); err != nil {
			s.logger.WithError(err).Error("❌ Failed to unmarshal event")
			msg.Nack(false, false)
			continue
		}

		s.processIncomingEvent(event)
		msg.Ack(false)
		s.metrics.EventsProcessed.Inc()
	}
}

func (s *Service) consumeFromRedis() {
	ctx := context.Background()
	consumerGroup := "payment-service"
	consumerName := "payment-worker"
	streamName := "events"

	// Create consumer group
	s.redisClient.XGroupCreateMkStream(ctx, streamName, consumerGroup, "0")

	for {
		streams, err := s.redisClient.XReadGroup(ctx, &redis.XReadGroupArgs{
			Group:    consumerGroup,
			Consumer: consumerName,
			Streams:  []string{streamName, ">"},
			Count:    10,
			Block:    time.Second,
		}).Result()

		if err != nil {
			if err != redis.Nil {
				s.logger.WithError(err).Error("❌ Error reading from Redis stream")
			}
			continue
		}

		for _, stream := range streams {
			for _, message := range stream.Messages {
				s.processRedisEvent(message)
				s.redisClient.XAck(ctx, streamName, consumerGroup, message.ID)
				s.metrics.EventsProcessed.Inc()
			}
		}
	}
}

func (s *Service) processIncomingEvent(event Event) {
	s.logger.WithFields(logrus.Fields{
		"event_type": event.Type,
		"service":    event.Service,
	}).Info("📨 Processing incoming event")

	switch event.Type {
	case "order.created":
		s.handleOrderCreated(event)
	case "order.cancelled":
		s.handleOrderCancelled(event)
	}
}

func (s *Service) processRedisEvent(message redis.XMessage) {
	eventType, _ := message.Values["type"].(string)
	service, _ := message.Values["service"].(string)
	
	if service == "payment-service" {
		// Skip our own events
		return
	}

	s.logger.WithFields(logrus.Fields{
		"event_type": eventType,
		"service":    service,
		"message_id": message.ID,
	}).Info("📨 Processing Redis event")

	switch eventType {
	case "order.created":
		s.handleOrderCreatedFromRedis(message)
	}
}

func (s *Service) handleOrderCreated(event Event) {
	// Handle order created from RabbitMQ
	data, ok := event.Data.(map[string]interface{})
	if !ok {
		s.logger.Error("❌ Invalid event data format")
		return
	}

	orderID, _ := data["order_id"].(string)
	userID, _ := data["user_id"].(float64)
	amount, _ := data["amount"].(float64)

	s.logger.WithFields(logrus.Fields{
		"order_id": orderID,
		"user_id":  int(userID),
		"amount":   amount,
	}).Info("🛍️ Order created, initiating payment")

	// Auto-create payment for the order
	payment := &Payment{
		ID:      uuid.New().String(),
		OrderID: orderID,
		UserID:  int(userID),
		Amount:  amount,
		Status:  "pending",
		Method:  "auto", // Auto-payment for demo
		Created: time.Now().UTC(),
		Updated: time.Now().UTC(),
	}

	s.payments[payment.ID] = payment
	s.metrics.PaymentsTotal.Inc()
	s.metrics.PaymentsByStatus.WithLabelValues("pending").Inc()

	// Process payment asynchronously
	go s.processPayment(payment)
}

func (s *Service) handleOrderCreatedFromRedis(message redis.XMessage) {
	orderID, _ := message.Values["order_id"].(string)
	userIDStr, _ := message.Values["user_id"].(string)
	data, _ := message.Values["data"].(string)

	var orderData map[string]interface{}
	if err := json.Unmarshal([]byte(data), &orderData); err != nil {
		s.logger.WithError(err).Error("❌ Failed to unmarshal order data")
		return
	}

	userID, _ := strconv.Atoi(userIDStr)
	amount, _ := orderData["total"].(float64)

	s.logger.WithFields(logrus.Fields{
		"order_id": orderID,
		"user_id":  userID,
		"amount":   amount,
	}).Info("🛍️ Order created (Redis), initiating payment")

	// Auto-create payment for the order
	payment := &Payment{
		ID:      uuid.New().String(),
		OrderID: orderID,
		UserID:  userID,
		Amount:  amount,
		Status:  "pending",
		Method:  "auto", // Auto-payment for demo
		Created: time.Now().UTC(),
		Updated: time.Now().UTC(),
	}

	s.payments[payment.ID] = payment
	s.metrics.PaymentsTotal.Inc()
	s.metrics.PaymentsByStatus.WithLabelValues("pending").Inc()

	// Process payment asynchronously
	go s.processPayment(payment)
}

func (s *Service) handleOrderCancelled(event Event) {
	data, ok := event.Data.(map[string]interface{})
	if !ok {
		return
	}

	orderID, _ := data["order_id"].(string)
	
	// Find pending payments for this order and cancel them
	for _, payment := range s.payments {
		if payment.OrderID == orderID && payment.Status == "pending" {
			payment.Status = "cancelled"
			payment.Updated = time.Now().UTC()
			
			s.publishEvent("payment.cancelled", payment.ID, orderID, map[string]interface{}{
				"reason": "Order cancelled",
				"amount": payment.Amount,
			})
			
			s.logger.WithField("payment_id", payment.ID).Info("❌ Payment cancelled due to order cancellation")
		}
	}
}

// HTTP Handlers
func (s *Service) setupRoutes() *gin.Engine {
	if !s.config.Debug {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// Health check
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service":   "payment-service",
			"status":    "running",
			"timestamp": time.Now().UTC(),
		})
	})

	r.GET("/health", func(c *gin.Context) {
		health := s.healthCheck()
		status := http.StatusOK
		if health["status"] != "healthy" {
			status = http.StatusServiceUnavailable
		}
		c.JSON(status, health)
	})

	// Metrics
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Payment routes
	api := r.Group("/api/v1")
	{
		api.POST("/payments", s.createPayment)
		api.GET("/payments/:id", s.getPayment)
		api.GET("/payments", s.listPayments)
		api.POST("/payments/:id/retry", s.retryPayment)
		api.DELETE("/payments/:id", s.cancelPayment)
	}

	return r
}

func (s *Service) createPayment(c *gin.Context) {
	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payment := &Payment{
		ID:      uuid.New().String(),
		OrderID: req.OrderID,
		UserID:  req.UserID,
		Amount:  req.Amount,
		Status:  "pending",
		Method:  req.Method,
		Created: time.Now().UTC(),
		Updated: time.Now().UTC(),
	}

	s.payments[payment.ID] = payment
	s.metrics.PaymentsTotal.Inc()
	s.metrics.PaymentsByStatus.WithLabelValues("pending").Inc()

	s.logger.WithFields(logrus.Fields{
		"payment_id": payment.ID,
		"order_id":   payment.OrderID,
		"amount":     payment.Amount,
	}).Info("💳 Payment created")

	// Process payment asynchronously
	go s.processPayment(payment)

	c.JSON(http.StatusCreated, payment)
}

func (s *Service) getPayment(c *gin.Context) {
	id := c.Param("id")
	payment, exists := s.payments[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	c.JSON(http.StatusOK, payment)
}

func (s *Service) listPayments(c *gin.Context) {
	var payments []*Payment
	for _, payment := range s.payments {
		payments = append(payments, payment)
	}

	c.JSON(http.StatusOK, gin.H{
		"payments": payments,
		"total":    len(payments),
	})
}

func (s *Service) retryPayment(c *gin.Context) {
	id := c.Param("id")
	payment, exists := s.payments[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	if payment.Status != "failed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Can only retry failed payments"})
		return
	}

	payment.Status = "pending"
	payment.Updated = time.Now().UTC()

	// Process payment asynchronously
	go s.processPayment(payment)

	s.logger.WithField("payment_id", payment.ID).Info("🔄 Payment retry initiated")
	c.JSON(http.StatusOK, payment)
}

func (s *Service) cancelPayment(c *gin.Context) {
	id := c.Param("id")
	payment, exists := s.payments[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	if payment.Status == "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot cancel completed payment"})
		return
	}

	payment.Status = "cancelled"
	payment.Updated = time.Now().UTC()

	s.publishEvent("payment.cancelled", payment.ID, payment.OrderID, map[string]interface{}{
		"reason": "Manual cancellation",
		"amount": payment.Amount,
	})

	s.logger.WithField("payment_id", payment.ID).Info("❌ Payment cancelled")
	c.JSON(http.StatusOK, payment)
}

func (s *Service) healthCheck() map[string]interface{} {
	health := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"dependencies": map[string]string{
			"redis":    "healthy",
			"rabbitmq": "healthy",
		},
	}

	// Check Redis
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := s.redisClient.Ping(ctx).Err(); err != nil {
		health["dependencies"].(map[string]string)["redis"] = "unhealthy"
		health["status"] = "unhealthy"
	}

	// Check RabbitMQ
	if s.rabbitConn == nil || s.rabbitConn.IsClosed() {
		health["dependencies"].(map[string]string)["rabbitmq"] = "unhealthy"
		health["status"] = "unhealthy"
	}

	return health
}

func (s *Service) Start() error {
	// Connect to dependencies
	if err := s.connectRedis(); err != nil {
		return err
	}

	if err := s.connectRabbitMQ(); err != nil {
		return err
	}

	// Start event consumer
	s.consumeEvents()

	// Setup HTTP server
	router := s.setupRoutes()
	
	s.logger.WithField("port", s.config.Port).Info("🚀 Starting Payment Service")
	
	return router.Run(":" + s.config.Port)
}

func (s *Service) Stop() {
	s.logger.Info("👋 Shutting down Payment Service")
	
	if s.redisClient != nil {
		s.redisClient.Close()
	}
	
	if s.rabbitCh != nil {
		s.rabbitCh.Close()
	}
	
	if s.rabbitConn != nil {
		s.rabbitConn.Close()
	}
}

func mustMarshal(v interface{}) string {
	data, _ := json.Marshal(v)
	return string(data)
}

func loadConfig() *Config {
	return &Config{
		Port:      getEnv("PORT", "3000"),
		RedisURL:  getEnv("REDIS_URL", "redis://redis:6379/1"),
		RabbitURL: getEnv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/"),
		Debug:     getEnv("DEBUG", "false") == "true",
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	// Command line flags
	var healthCheck = flag.Bool("health", false, "Run health check")
	flag.Parse()

	// Health check mode
	if *healthCheck {
		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Get("http://localhost:3000/health")
		if err != nil {
			fmt.Printf("Health check failed: %v\n", err)
			os.Exit(1)
		}
		defer resp.Body.Close()

		if resp.StatusCode == http.StatusOK {
			fmt.Println("Service is healthy")
			os.Exit(0)
		} else {
			fmt.Printf("Service is unhealthy: %d\n", resp.StatusCode)
			os.Exit(1)
		}
	}

	// Load configuration
	config := loadConfig()
	
	// Initialize service
	service := NewService(config)

	// Handle graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-sigChan
		service.Stop()
		os.Exit(0)
	}()

	// Start service
	if err := service.Start(); err != nil {
		log.Fatalf("Failed to start service: %v", err)
	}
}
