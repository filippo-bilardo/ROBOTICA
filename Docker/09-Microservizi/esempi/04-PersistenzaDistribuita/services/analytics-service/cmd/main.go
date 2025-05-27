package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"analytics-service/internal/config"
	"analytics-service/internal/database"
	"analytics-service/internal/handlers"
	"analytics-service/internal/kafka"
	"analytics-service/internal/metrics"
	"analytics-service/internal/redis"
	"analytics-service/internal/services"
	"analytics-service/internal/tracing"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Analytics Service API
// @version 1.0
// @description Analytics microservice for distributed persistence demo
// @host localhost:8080
// @BasePath /api/v1
func main() {
	// Load configuration
	cfg := config.Load()

	// Setup logging
	logrus.SetLevel(logrus.InfoLevel)
	if cfg.LogLevel == "debug" {
		logrus.SetLevel(logrus.DebugLevel)
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	logrus.WithField("service", cfg.ServiceName).Info("Starting Analytics Service")

	// Initialize tracing
	tracer, closer, err := tracing.Init(cfg)
	if err != nil {
		logrus.WithError(err).Fatal("Failed to initialize tracing")
	}
	defer closer.Close()

	// Initialize metrics
	metrics.Init()

	// Initialize ClickHouse
	db, err := database.NewClickHouse(cfg)
	if err != nil {
		logrus.WithError(err).Fatal("Failed to connect to ClickHouse")
	}
	defer db.Close()

	// Initialize Redis
	redisClient, err := redis.NewClient(cfg)
	if err != nil {
		logrus.WithError(err).Fatal("Failed to connect to Redis")
	}
	defer redisClient.Close()

	// Initialize services
	analyticsService := services.NewAnalyticsService(db, redisClient)

	// Initialize Kafka consumer
	kafkaConsumer, err := kafka.NewConsumer(cfg, analyticsService)
	if err != nil {
		logrus.WithError(err).Fatal("Failed to initialize Kafka consumer")
	}

	// Start Kafka consumer in background
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		if err := kafkaConsumer.Start(ctx); err != nil {
			logrus.WithError(err).Error("Kafka consumer error")
		}
	}()

	// Setup HTTP server
	router := gin.New()
	
	// Middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(tracing.Middleware(tracer))
	router.Use(metrics.Middleware())

	// Health endpoints
	router.GET("/health", handlers.HealthCheck(db, redisClient))
	router.GET("/ready", handlers.ReadinessCheck(db, redisClient))
	
	// Metrics endpoint
	router.GET("/metrics", gin.WrapH(metrics.Handler()))

	// API routes
	api := router.Group("/api/v1")
	{
		// Analytics endpoints
		analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)
		
		api.GET("/analytics/orders", analyticsHandler.GetOrderAnalytics)
		api.GET("/analytics/users", analyticsHandler.GetUserAnalytics)
		api.GET("/analytics/products", analyticsHandler.GetProductAnalytics)
		api.GET("/analytics/revenue", analyticsHandler.GetRevenueAnalytics)
		api.GET("/analytics/dashboard", analyticsHandler.GetDashboardData)
		
		// Real-time metrics
		api.GET("/metrics/realtime", analyticsHandler.GetRealtimeMetrics)
		api.GET("/metrics/trends", analyticsHandler.GetTrends)
		
		// Reports
		api.GET("/reports/daily", analyticsHandler.GetDailyReport)
		api.GET("/reports/weekly", analyticsHandler.GetWeeklyReport)
		api.GET("/reports/monthly", analyticsHandler.GetMonthlyReport)
	}

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Setup HTTP server
	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: router,
	}

	// Start server in goroutine
	go func() {
		logrus.WithField("port", cfg.Port).Info("Analytics Service is running")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.WithError(err).Fatal("Failed to start server")
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logrus.Info("Shutting down Analytics Service...")

	// Cancel Kafka consumer
	cancel()

	// Shutdown HTTP server
	ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	
	if err := srv.Shutdown(ctx); err != nil {
		logrus.WithError(err).Error("Server forced to shutdown")
	}

	logrus.Info("Analytics Service stopped")
}
