package tracing

import (
	"fmt"
	"io"
	"time"

	"analytics-service/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/opentracing/opentracing-go"
	"github.com/opentracing/opentracing-go/ext"
	"github.com/uber/jaeger-client-go"
	jaegercfg "github.com/uber/jaeger-client-go/config"
	"github.com/uber/jaeger-client-go/zipkin"
)

func Init(cfg *config.Config) (opentracing.Tracer, io.Closer, error) {
	jaegerCfg := jaegercfg.Configuration{
		ServiceName: cfg.ServiceName,
		Sampler: &jaegercfg.SamplerConfig{
			Type:  jaeger.SamplerTypeConst,
			Param: cfg.JaegerSampler,
		},
		Reporter: &jaegercfg.ReporterConfig{
			LogSpans:            true,
			BufferFlushInterval: 1 * time.Second,
			LocalAgentHostPort:  "jaeger:6831",
		},
	}

	// Zipkin shares span format with Jaeger
	zipkinPropagator := zipkin.NewZipkinB3HTTPHeaderPropagator()
	
	tracer, closer, err := jaegerCfg.NewTracer(
		jaegercfg.Logger(jaeger.StdLogger),
		jaegercfg.ZipkinSharedRPCSpan(true),
		jaegercfg.Injector(opentracing.HTTPHeaders, zipkinPropagator),
		jaegercfg.Extractor(opentracing.HTTPHeaders, zipkinPropagator),
	)
	
	if err != nil {
		return nil, nil, fmt.Errorf("failed to initialize Jaeger tracer: %w", err)
	}

	opentracing.SetGlobalTracer(tracer)
	return tracer, closer, nil
}

// HTTP middleware for tracing
func Middleware(tracer opentracing.Tracer) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		operationName := fmt.Sprintf("%s %s", c.Request.Method, c.FullPath())
		
		// Extract span context from headers
		spanCtx, _ := tracer.Extract(
			opentracing.HTTPHeaders,
			opentracing.HTTPHeadersCarrier(c.Request.Header),
		)

		// Start a new span
		span := tracer.StartSpan(operationName, ext.RPCServerOption(spanCtx))
		defer span.Finish()

		// Set standard tags
		ext.HTTPMethod.Set(span, c.Request.Method)
		ext.HTTPUrl.Set(span, c.Request.URL.String())
		ext.Component.Set(span, "analytics-service")

		// Store span in context
		c.Set("tracing-span", span)
		
		c.Next()

		// Set response status
		ext.HTTPStatusCode.Set(span, uint16(c.Writer.Status()))
		if c.Writer.Status() >= 400 {
			ext.Error.Set(span, true)
		}
	})
}

// Get span from Gin context
func SpanFromContext(c *gin.Context) opentracing.Span {
	if span, exists := c.Get("tracing-span"); exists {
		return span.(opentracing.Span)
	}
	return nil
}

// Start a child span for database operations
func StartDBSpan(parentSpan opentracing.Span, operation, query string) opentracing.Span {
	span := opentracing.StartSpan(
		fmt.Sprintf("db:%s", operation),
		opentracing.ChildOf(parentSpan.Context()),
	)
	
	ext.DBType.Set(span, "clickhouse")
	ext.DBStatement.Set(span, query)
	ext.Component.Set(span, "database")
	
	return span
}

// Start a child span for cache operations
func StartCacheSpan(parentSpan opentracing.Span, operation, key string) opentracing.Span {
	span := opentracing.StartSpan(
		fmt.Sprintf("cache:%s", operation),
		opentracing.ChildOf(parentSpan.Context()),
	)
	
	span.SetTag("cache.key", key)
	span.SetTag("cache.type", "redis")
	ext.Component.Set(span, "cache")
	
	return span
}

// Start a child span for Kafka operations
func StartKafkaSpan(parentSpan opentracing.Span, operation, topic string) opentracing.Span {
	span := opentracing.StartSpan(
		fmt.Sprintf("kafka:%s", operation),
		opentracing.ChildOf(parentSpan.Context()),
	)
	
	span.SetTag("messaging.system", "kafka")
	span.SetTag("messaging.destination", topic)
	span.SetTag("messaging.operation", operation)
	ext.Component.Set(span, "kafka")
	
	return span
}

// Start a child span for service operations
func StartServiceSpan(parentSpan opentracing.Span, service, operation string) opentracing.Span {
	span := opentracing.StartSpan(
		fmt.Sprintf("%s:%s", service, operation),
		opentracing.ChildOf(parentSpan.Context()),
	)
	
	span.SetTag("service.name", service)
	span.SetTag("service.operation", operation)
	ext.Component.Set(span, "service")
	
	return span
}

// Add error to span
func LogError(span opentracing.Span, err error) {
	if err != nil {
		ext.Error.Set(span, true)
		span.LogKV("error", err.Error())
	}
}

// Add custom tags to span
func SetTags(span opentracing.Span, tags map[string]interface{}) {
	for key, value := range tags {
		span.SetTag(key, value)
	}
}

// Log structured data to span
func LogKV(span opentracing.Span, keyValues ...interface{}) {
	span.LogKV(keyValues...)
}
