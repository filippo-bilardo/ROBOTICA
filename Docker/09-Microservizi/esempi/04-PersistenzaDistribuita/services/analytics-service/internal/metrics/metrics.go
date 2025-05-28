package metrics

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	// HTTP metrics
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)

	httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "analytics_http_request_duration_seconds",
			Help: "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	// Database metrics
	dbConnectionsActive = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "analytics_db_connections_active",
			Help: "Number of active database connections",
		},
	)

	dbQueryDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "analytics_db_query_duration_seconds",
			Help: "Database query duration in seconds",
			Buckets: []float64{0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5},
		},
		[]string{"query_type"},
	)

	dbQueryErrors = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_db_query_errors_total",
			Help: "Total number of database query errors",
		},
		[]string{"query_type", "error_type"},
	)

	// Cache metrics
	cacheHitsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_cache_hits_total",
			Help: "Total number of cache hits",
		},
		[]string{"cache_type"},
	)

	cacheMissesTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_cache_misses_total",
			Help: "Total number of cache misses",
		},
		[]string{"cache_type"},
	)

	cacheOperationDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "analytics_cache_operation_duration_seconds",
			Help: "Cache operation duration in seconds",
			Buckets: []float64{0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1},
		},
		[]string{"operation", "cache_type"},
	)

	// Kafka metrics
	kafkaMessagesConsumed = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_kafka_messages_consumed_total",
			Help: "Total number of Kafka messages consumed",
		},
		[]string{"topic"},
	)

	kafkaMessageProcessingDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "analytics_kafka_message_processing_duration_seconds",
			Help: "Kafka message processing duration in seconds",
			Buckets: []float64{0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1},
		},
		[]string{"topic", "event_type"},
	)

	kafkaProcessingErrors = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_kafka_processing_errors_total",
			Help: "Total number of Kafka message processing errors",
		},
		[]string{"topic", "error_type"},
	)

	// Business metrics
	analyticsQueriesTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "analytics_queries_total",
			Help: "Total number of analytics queries",
		},
		[]string{"query_type"},
	)

	analyticsQueryLatency = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "analytics_query_latency_seconds",
			Help: "Analytics query latency in seconds",
			Buckets: []float64{0.1, 0.5, 1, 2, 5, 10, 30},
		},
		[]string{"query_type"},
	)

	// System metrics
	memoryUsage = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "analytics_memory_usage_bytes",
			Help: "Memory usage in bytes",
		},
	)

	goroutinesActive = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "analytics_goroutines_active",
			Help: "Number of active goroutines",
		},
	)
)

func Init() {
	// Register all metrics
	prometheus.MustRegister(
		httpRequestsTotal,
		httpRequestDuration,
		dbConnectionsActive,
		dbQueryDuration,
		dbQueryErrors,
		cacheHitsTotal,
		cacheMissesTotal,
		cacheOperationDuration,
		kafkaMessagesConsumed,
		kafkaMessageProcessingDuration,
		kafkaProcessingErrors,
		analyticsQueriesTotal,
		analyticsQueryLatency,
		memoryUsage,
		goroutinesActive,
	)
}

func Handler() http.Handler {
	return promhttp.Handler()
}

// HTTP middleware for metrics
func Middleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		c.Next()

		status := strconv.Itoa(c.Writer.Status())
		duration := time.Since(start).Seconds()

		httpRequestsTotal.WithLabelValues(method, path, status).Inc()
		httpRequestDuration.WithLabelValues(method, path).Observe(duration)
	})
}

// Database metrics
func RecordDBConnection(active int) {
	dbConnectionsActive.Set(float64(active))
}

func RecordDBQuery(queryType string, duration time.Duration) {
	dbQueryDuration.WithLabelValues(queryType).Observe(duration.Seconds())
}

func RecordDBError(queryType, errorType string) {
	dbQueryErrors.WithLabelValues(queryType, errorType).Inc()
}

// Cache metrics
func RecordCacheHit(cacheType string) {
	cacheHitsTotal.WithLabelValues(cacheType).Inc()
}

func RecordCacheMiss(cacheType string) {
	cacheMissesTotal.WithLabelValues(cacheType).Inc()
}

func RecordCacheOperation(operation, cacheType string, duration time.Duration) {
	cacheOperationDuration.WithLabelValues(operation, cacheType).Observe(duration.Seconds())
}

// Kafka metrics
func RecordKafkaMessage(topic string) {
	kafkaMessagesConsumed.WithLabelValues(topic).Inc()
}

func RecordKafkaProcessing(topic, eventType string, duration time.Duration) {
	kafkaMessageProcessingDuration.WithLabelValues(topic, eventType).Observe(duration.Seconds())
}

func RecordKafkaError(topic, errorType string) {
	kafkaProcessingErrors.WithLabelValues(topic, errorType).Inc()
}

// Business metrics
func RecordAnalyticsQuery(queryType string) {
	analyticsQueriesTotal.WithLabelValues(queryType).Inc()
}

func RecordAnalyticsQueryLatency(queryType string, duration time.Duration) {
	analyticsQueryLatency.WithLabelValues(queryType).Observe(duration.Seconds())
}

// System metrics
func RecordMemoryUsage(bytes int64) {
	memoryUsage.Set(float64(bytes))
}

func RecordGoroutines(count int) {
	goroutinesActive.Set(float64(count))
}

// Helper functions for timing operations
func TimeDBQuery(queryType string, fn func() error) error {
	start := time.Now()
	err := fn()
	duration := time.Since(start)
	
	RecordDBQuery(queryType, duration)
	if err != nil {
		RecordDBError(queryType, "execution_error")
	}
	
	return err
}

func TimeCacheOperation(operation, cacheType string, fn func() error) error {
	start := time.Now()
	err := fn()
	duration := time.Since(start)
	
	RecordCacheOperation(operation, cacheType, duration)
	
	return err
}

func TimeKafkaProcessing(topic, eventType string, fn func() error) error {
	start := time.Now()
	err := fn()
	duration := time.Since(start)
	
	RecordKafkaProcessing(topic, eventType, duration)
	if err != nil {
		RecordKafkaError(topic, "processing_error")
	}
	
	return err
}

func TimeAnalyticsQuery(queryType string, fn func() error) error {
	start := time.Now()
	err := fn()
	duration := time.Since(start)
	
	RecordAnalyticsQuery(queryType)
	RecordAnalyticsQueryLatency(queryType, duration)
	
	return err
}
