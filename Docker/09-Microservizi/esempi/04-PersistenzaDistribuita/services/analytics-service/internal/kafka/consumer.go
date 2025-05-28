package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"analytics-service/internal/config"
	"analytics-service/internal/metrics"
	"analytics-service/internal/services"

	"github.com/Shopify/sarama"
	"github.com/sirupsen/logrus"
)

type Consumer struct {
	client   sarama.ConsumerGroup
	topics   []string
	service  *services.AnalyticsService
	handlers map[string]EventHandler
}

type EventHandler func(ctx context.Context, eventData map[string]interface{}) error

type consumerGroupHandler struct {
	consumer *Consumer
}

func NewConsumer(cfg *config.Config, analyticsService *services.AnalyticsService) (*Consumer, error) {
	config := sarama.NewConfig()
	config.Version = sarama.V2_6_0_0
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRoundRobin
	config.Consumer.Offsets.Initial = sarama.OffsetNewest
	config.Consumer.Group.Session.Timeout = 10 * time.Second
	config.Consumer.Group.Heartbeat.Interval = 3 * time.Second
	config.Consumer.MaxProcessingTime = 60 * time.Second

	client, err := sarama.NewConsumerGroup(cfg.KafkaBrokers, cfg.KafkaGroupID, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kafka consumer group: %w", err)
	}

	consumer := &Consumer{
		client:  client,
		topics:  cfg.KafkaTopics,
		service: analyticsService,
		handlers: make(map[string]EventHandler),
	}

	// Register event handlers
	consumer.registerHandlers()

	logrus.WithFields(logrus.Fields{
		"brokers": cfg.KafkaBrokers,
		"group":   cfg.KafkaGroupID,
		"topics":  cfg.KafkaTopics,
	}).Info("Kafka consumer initialized")

	return consumer, nil
}

func (c *Consumer) registerHandlers() {
	// User events
	c.handlers["microservices.user.created"] = c.handleUserEvent
	c.handlers["microservices.user.updated"] = c.handleUserEvent
	c.handlers["microservices.user.login"] = c.handleUserEvent
	c.handlers["microservices.user.logout"] = c.handleUserEvent

	// Order events
	c.handlers["microservices.order.created"] = c.handleOrderEvent
	c.handlers["microservices.order.updated"] = c.handleOrderEvent
	c.handlers["microservices.order.confirmed"] = c.handleOrderEvent
	c.handlers["microservices.order.shipped"] = c.handleOrderEvent
	c.handlers["microservices.order.delivered"] = c.handleOrderEvent
	c.handlers["microservices.order.cancelled"] = c.handleOrderEvent

	// Product events
	c.handlers["microservices.product.viewed"] = c.handleProductEvent
	c.handlers["microservices.product.searched"] = c.handleProductEvent
	c.handlers["microservices.product.added_to_cart"] = c.handleProductEvent
	c.handlers["microservices.product.removed_from_cart"] = c.handleProductEvent

	// Inventory events
	c.handlers["microservices.inventory.updated"] = c.handleInventoryEvent
	c.handlers["microservices.inventory.low_stock"] = c.handleInventoryEvent

	// Payment events
	c.handlers["microservices.payment.processed"] = c.handlePaymentEvent
	c.handlers["microservices.payment.failed"] = c.handlePaymentEvent

	logrus.WithField("handlers", len(c.handlers)).Info("Event handlers registered")
}

func (c *Consumer) Start(ctx context.Context) error {
	handler := &consumerGroupHandler{consumer: c}

	for {
		select {
		case <-ctx.Done():
			logrus.Info("Kafka consumer stopping...")
			return c.client.Close()
		default:
			err := c.client.Consume(ctx, c.topics, handler)
			if err != nil {
				logrus.WithError(err).Error("Kafka consumer error")
				// Wait before retrying
				time.Sleep(5 * time.Second)
			}
		}
	}
}

// ConsumerGroupHandler implementation
func (h *consumerGroupHandler) Setup(sarama.ConsumerGroupSession) error {
	logrus.Info("Kafka consumer group session setup")
	return nil
}

func (h *consumerGroupHandler) Cleanup(sarama.ConsumerGroupSession) error {
	logrus.Info("Kafka consumer group session cleanup")
	return nil
}

func (h *consumerGroupHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for {
		select {
		case message := <-claim.Messages():
			if message == nil {
				return nil
			}

			start := time.Now()
			err := h.consumer.processMessage(session.Context(), message)
			
			metrics.RecordKafkaMessage(message.Topic)
			
			if err != nil {
				logrus.WithError(err).WithFields(logrus.Fields{
					"topic":     message.Topic,
					"partition": message.Partition,
					"offset":    message.Offset,
				}).Error("Failed to process Kafka message")
				
				metrics.RecordKafkaError(message.Topic, "processing_error")
				// Don't mark message as processed on error
				continue
			}

			// Record processing time
			duration := time.Since(start)
			eventType := h.extractEventType(message.Value)
			metrics.RecordKafkaProcessing(message.Topic, eventType, duration)

			// Mark message as processed
			session.MarkMessage(message, "")

		case <-session.Context().Done():
			return nil
		}
	}
}

func (c *Consumer) processMessage(ctx context.Context, message *sarama.ConsumerMessage) error {
	// Parse message
	var eventData map[string]interface{}
	if err := json.Unmarshal(message.Value, &eventData); err != nil {
		return fmt.Errorf("failed to unmarshal message: %w", err)
	}

	// Add metadata
	eventData["kafka_topic"] = message.Topic
	eventData["kafka_partition"] = message.Partition
	eventData["kafka_offset"] = message.Offset
	eventData["kafka_timestamp"] = message.Timestamp
	eventData["processed_at"] = time.Now()

	// Find and execute handler
	handler, exists := c.handlers[message.Topic]
	if !exists {
		logrus.WithField("topic", message.Topic).Warn("No handler found for topic")
		return nil // Don't treat as error
	}

	// Execute handler with timeout
	handlerCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	return handler(handlerCtx, eventData)
}

func (h *consumerGroupHandler) extractEventType(messageData []byte) string {
	var data map[string]interface{}
	if err := json.Unmarshal(messageData, &data); err != nil {
		return "unknown"
	}

	if eventType, ok := data["event_type"].(string); ok {
		return eventType
	}

	return "unknown"
}

// Event Handlers
func (c *Consumer) handleUserEvent(ctx context.Context, eventData map[string]interface{}) error {
	logrus.WithFields(logrus.Fields{
		"event_type": eventData["event_type"],
		"user_id":    eventData["user_id"],
	}).Debug("Processing user event")

	// Enrich user event data
	c.enrichUserEventData(eventData)

	return c.service.ProcessUserEvent(ctx, eventData)
}

func (c *Consumer) handleOrderEvent(ctx context.Context, eventData map[string]interface{}) error {
	logrus.WithFields(logrus.Fields{
		"event_type": eventData["event_type"],
		"order_id":   eventData["order_id"],
		"user_id":    eventData["user_id"],
	}).Debug("Processing order event")

	// Enrich order event data
	c.enrichOrderEventData(eventData)

	return c.service.ProcessOrderEvent(ctx, eventData)
}

func (c *Consumer) handleProductEvent(ctx context.Context, eventData map[string]interface{}) error {
	logrus.WithFields(logrus.Fields{
		"event_type":  eventData["event_type"],
		"product_id":  eventData["product_id"],
		"user_id":     eventData["user_id"],
	}).Debug("Processing product event")

	// Enrich product event data
	c.enrichProductEventData(eventData)

	return c.service.ProcessProductEvent(ctx, eventData)
}

func (c *Consumer) handleInventoryEvent(ctx context.Context, eventData map[string]interface{}) error {
	logrus.WithFields(logrus.Fields{
		"event_type":  eventData["event_type"],
		"product_id":  eventData["product_id"],
	}).Debug("Processing inventory event")

	// Convert inventory event to product event for analytics
	productEventData := map[string]interface{}{
		"event_id":    eventData["event_id"],
		"event_type":  "InventoryChanged",
		"product_id":  eventData["product_id"],
		"product_name": eventData["product_name"],
		"category":    eventData["category"],
		"stock_level": eventData["stock_level"],
		"created_at":  eventData["created_at"],
	}

	return c.service.ProcessProductEvent(ctx, productEventData)
}

func (c *Consumer) handlePaymentEvent(ctx context.Context, eventData map[string]interface{}) error {
	logrus.WithFields(logrus.Fields{
		"event_type": eventData["event_type"],
		"order_id":   eventData["order_id"],
		"amount":     eventData["amount"],
	}).Debug("Processing payment event")

	// Convert payment event to order event for analytics
	orderEventData := map[string]interface{}{
		"event_id":     eventData["event_id"],
		"event_type":   "PaymentProcessed",
		"order_id":     eventData["order_id"],
		"user_id":      eventData["user_id"],
		"total_amount": eventData["amount"],
		"status":       eventData["status"],
		"created_at":   eventData["created_at"],
	}

	return c.service.ProcessOrderEvent(ctx, orderEventData)
}

// Data enrichment functions
func (c *Consumer) enrichUserEventData(eventData map[string]interface{}) {
	// Set default values if missing
	if _, exists := eventData["event_id"]; !exists {
		eventData["event_id"] = fmt.Sprintf("user_%d", time.Now().UnixNano())
	}

	if _, exists := eventData["created_at"]; !exists {
		eventData["created_at"] = time.Now()
	}

	// Extract session duration for login events
	if eventType, ok := eventData["event_type"].(string); ok && eventType == "UserLogin" {
		if sessionStart, ok := eventData["session_start"].(string); ok {
			if startTime, err := time.Parse(time.RFC3339, sessionStart); err == nil {
				duration := time.Since(startTime).Seconds()
				eventData["session_duration"] = duration
			}
		}
	}
}

func (c *Consumer) enrichOrderEventData(eventData map[string]interface{}) {
	if _, exists := eventData["event_id"]; !exists {
		eventData["event_id"] = fmt.Sprintf("order_%d", time.Now().UnixNano())
	}

	if _, exists := eventData["created_at"]; !exists {
		eventData["created_at"] = time.Now()
	}

	// Extract product information from order items
	if items, ok := eventData["items"].([]interface{}); ok && len(items) > 0 {
		if item, ok := items[0].(map[string]interface{}); ok {
			eventData["product_id"] = item["product_id"]
			eventData["product_name"] = item["product_name"]
			eventData["category"] = item["category"]
			eventData["quantity"] = item["quantity"]
		}
	}

	// Set default status
	if _, exists := eventData["status"]; !exists {
		eventData["status"] = "unknown"
	}
}

func (c *Consumer) enrichProductEventData(eventData map[string]interface{}) {
	if _, exists := eventData["event_id"]; !exists {
		eventData["event_id"] = fmt.Sprintf("product_%d", time.Now().UnixNano())
	}

	if _, exists := eventData["created_at"]; !exists {
		eventData["created_at"] = time.Now()
	}

	// Set category if not provided
	if _, exists := eventData["category"]; !exists {
		eventData["category"] = "uncategorized"
	}

	// Extract search query for search events
	if eventType, ok := eventData["event_type"].(string); ok && eventType == "ProductSearched" {
		if query, ok := eventData["query"].(string); ok {
			eventData["search_query"] = query
		}
	}
}
