package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"analytics-service/internal/database"
	"analytics-service/internal/metrics"
	"analytics-service/internal/redis"

	"github.com/opentracing/opentracing-go"
	"github.com/sirupsen/logrus"
)

type AnalyticsService struct {
	db    *database.ClickHouse
	cache *redis.Client
}

func NewAnalyticsService(db *database.ClickHouse, cache *redis.Client) *AnalyticsService {
	return &AnalyticsService{
		db:    db,
		cache: cache,
	}
}

// Order Analytics
func (s *AnalyticsService) GetOrderAnalytics(ctx context.Context, from, to time.Time, span opentracing.Span) ([]database.OrderAnalytics, error) {
	// Check cache first
	cacheKey := s.cache.GetAnalyticsCacheKey("orders", fmt.Sprintf("%s_%s", from.Format("20060102"), to.Format("20060102")))
	
	var result []database.OrderAnalytics
	err := s.cache.GetCache(ctx, cacheKey, &result)
	if err == nil {
		metrics.RecordCacheHit("order_analytics")
		if span != nil {
			span.LogKV("cache", "hit", "key", cacheKey)
		}
		return result, nil
	}

	metrics.RecordCacheMiss("order_analytics")
	if span != nil {
		span.LogKV("cache", "miss", "key", cacheKey)
	}

	// Query database
	err = metrics.TimeAnalyticsQuery("order_analytics", func() error {
		result, err = s.db.GetOrderAnalytics(ctx, from, to)
		return err
	})

	if err != nil {
		logrus.WithError(err).Error("Failed to get order analytics")
		return nil, fmt.Errorf("failed to get order analytics: %w", err)
	}

	// Cache the result
	go func() {
		cacheCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		if err := s.cache.SetCache(cacheCtx, cacheKey, result, 5*time.Minute); err != nil {
			logrus.WithError(err).Warn("Failed to cache order analytics")
		}
	}()

	return result, nil
}

// User Analytics
func (s *AnalyticsService) GetUserAnalytics(ctx context.Context, from, to time.Time, span opentracing.Span) ([]database.UserAnalytics, error) {
	cacheKey := s.cache.GetAnalyticsCacheKey("users", fmt.Sprintf("%s_%s", from.Format("20060102"), to.Format("20060102")))
	
	var result []database.UserAnalytics
	err := s.cache.GetCache(ctx, cacheKey, &result)
	if err == nil {
		metrics.RecordCacheHit("user_analytics")
		if span != nil {
			span.LogKV("cache", "hit", "key", cacheKey)
		}
		return result, nil
	}

	metrics.RecordCacheMiss("user_analytics")
	if span != nil {
		span.LogKV("cache", "miss", "key", cacheKey)
	}

	err = metrics.TimeAnalyticsQuery("user_analytics", func() error {
		result, err = s.db.GetUserAnalytics(ctx, from, to)
		return err
	})

	if err != nil {
		logrus.WithError(err).Error("Failed to get user analytics")
		return nil, fmt.Errorf("failed to get user analytics: %w", err)
	}

	// Cache the result
	go func() {
		cacheCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		if err := s.cache.SetCache(cacheCtx, cacheKey, result, 5*time.Minute); err != nil {
			logrus.WithError(err).Warn("Failed to cache user analytics")
		}
	}()

	return result, nil
}

// Product Analytics
func (s *AnalyticsService) GetProductAnalytics(ctx context.Context, from, to time.Time, limit int, span opentracing.Span) ([]database.ProductAnalytics, error) {
	cacheKey := s.cache.GetAnalyticsCacheKey("products", fmt.Sprintf("%s_%s_%d", from.Format("20060102"), to.Format("20060102"), limit))
	
	var result []database.ProductAnalytics
	err := s.cache.GetCache(ctx, cacheKey, &result)
	if err == nil {
		metrics.RecordCacheHit("product_analytics")
		if span != nil {
			span.LogKV("cache", "hit", "key", cacheKey)
		}
		return result, nil
	}

	metrics.RecordCacheMiss("product_analytics")
	if span != nil {
		span.LogKV("cache", "miss", "key", cacheKey)
	}

	err = metrics.TimeAnalyticsQuery("product_analytics", func() error {
		result, err = s.db.GetProductAnalytics(ctx, from, to, limit)
		return err
	})

	if err != nil {
		logrus.WithError(err).Error("Failed to get product analytics")
		return nil, fmt.Errorf("failed to get product analytics: %w", err)
	}

	// Cache the result
	go func() {
		cacheCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		if err := s.cache.SetCache(cacheCtx, cacheKey, result, 5*time.Minute); err != nil {
			logrus.WithError(err).Warn("Failed to cache product analytics")
		}
	}()

	return result, nil
}

// Revenue Analytics
func (s *AnalyticsService) GetRevenueAnalytics(ctx context.Context, from, to time.Time, groupBy string, span opentracing.Span) ([]database.RevenueAnalytics, error) {
	cacheKey := s.cache.GetAnalyticsCacheKey("revenue", fmt.Sprintf("%s_%s_%s", from.Format("20060102"), to.Format("20060102"), groupBy))
	
	var result []database.RevenueAnalytics
	err := s.cache.GetCache(ctx, cacheKey, &result)
	if err == nil {
		metrics.RecordCacheHit("revenue_analytics")
		if span != nil {
			span.LogKV("cache", "hit", "key", cacheKey)
		}
		return result, nil
	}

	metrics.RecordCacheMiss("revenue_analytics")
	if span != nil {
		span.LogKV("cache", "miss", "key", cacheKey)
	}

	err = metrics.TimeAnalyticsQuery("revenue_analytics", func() error {
		result, err = s.db.GetRevenueAnalytics(ctx, from, to, groupBy)
		return err
	})

	if err != nil {
		logrus.WithError(err).Error("Failed to get revenue analytics")
		return nil, fmt.Errorf("failed to get revenue analytics: %w", err)
	}

	// Cache the result
	go func() {
		cacheCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		if err := s.cache.SetCache(cacheCtx, cacheKey, result, 5*time.Minute); err != nil {
			logrus.WithError(err).Warn("Failed to cache revenue analytics")
		}
	}()

	return result, nil
}

// Dashboard Data
func (s *AnalyticsService) GetDashboardData(ctx context.Context, span opentracing.Span) (*database.DashboardData, error) {
	cacheKey := s.cache.GetDashboardCacheKey()
	
	var result *database.DashboardData
	err := s.cache.GetCache(ctx, cacheKey, &result)
	if err == nil {
		metrics.RecordCacheHit("dashboard")
		if span != nil {
			span.LogKV("cache", "hit", "key", cacheKey)
		}
		return result, nil
	}

	metrics.RecordCacheMiss("dashboard")
	if span != nil {
		span.LogKV("cache", "miss", "key", cacheKey)
	}

	err = metrics.TimeAnalyticsQuery("dashboard", func() error {
		result, err = s.db.GetDashboardData(ctx)
		return err
	})

	if err != nil {
		logrus.WithError(err).Error("Failed to get dashboard data")
		return nil, fmt.Errorf("failed to get dashboard data: %w", err)
	}

	// Cache the result with shorter TTL for real-time dashboard
	go func() {
		cacheCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		if err := s.cache.SetCache(cacheCtx, cacheKey, result, 2*time.Minute); err != nil {
			logrus.WithError(err).Warn("Failed to cache dashboard data")
		}
	}()

	return result, nil
}

// Real-time Metrics
func (s *AnalyticsService) GetRealtimeMetrics(ctx context.Context, span opentracing.Span) (map[string]interface{}, error) {
	cacheKey := s.cache.GetRealtimeCacheKey()
	
	var result map[string]interface{}
	err := s.cache.GetCache(ctx, cacheKey, &result)
	if err == nil {
		metrics.RecordCacheHit("realtime_metrics")
		if span != nil {
			span.LogKV("cache", "hit", "key", cacheKey)
		}
		return result, nil
	}

	metrics.RecordCacheMiss("realtime_metrics")
	if span != nil {
		span.LogKV("cache", "miss", "key", cacheKey)
	}

	err = metrics.TimeAnalyticsQuery("realtime_metrics", func() error {
		result, err = s.db.GetRealtimeMetrics(ctx)
		return err
	})

	if err != nil {
		logrus.WithError(err).Error("Failed to get realtime metrics")
		return nil, fmt.Errorf("failed to get realtime metrics: %w", err)
	}

	// Cache with very short TTL for real-time data
	go func() {
		cacheCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		
		if err := s.cache.SetCache(cacheCtx, cacheKey, result, 30*time.Second); err != nil {
			logrus.WithError(err).Warn("Failed to cache realtime metrics")
		}
	}()

	return result, nil
}

// Trends
func (s *AnalyticsService) GetTrends(ctx context.Context, days int, span opentracing.Span) (map[string]interface{}, error) {
	cacheKey := s.cache.GetAnalyticsCacheKey("trends", fmt.Sprintf("%d_days", days))
	
	var result map[string]interface{}
	err := s.cache.GetCache(ctx, cacheKey, &result)
	if err == nil {
		metrics.RecordCacheHit("trends")
		if span != nil {
			span.LogKV("cache", "hit", "key", cacheKey)
		}
		return result, nil
	}

	metrics.RecordCacheMiss("trends")
	if span != nil {
		span.LogKV("cache", "miss", "key", cacheKey)
	}

	err = metrics.TimeAnalyticsQuery("trends", func() error {
		result, err = s.db.GetTrends(ctx, days)
		return err
	})

	if err != nil {
		logrus.WithError(err).Error("Failed to get trends")
		return nil, fmt.Errorf("failed to get trends: %w", err)
	}

	// Cache trends data for 10 minutes
	go func() {
		cacheCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		
		if err := s.cache.SetCache(cacheCtx, cacheKey, result, 10*time.Minute); err != nil {
			logrus.WithError(err).Warn("Failed to cache trends")
		}
	}()

	return result, nil
}

// Event Processing Methods for Kafka Consumer
func (s *AnalyticsService) ProcessOrderEvent(ctx context.Context, eventData map[string]interface{}) error {
	// Insert into ClickHouse
	err := s.db.InsertOrderEvent(ctx, eventData)
	if err != nil {
		logrus.WithError(err).Error("Failed to insert order event")
		return fmt.Errorf("failed to insert order event: %w", err)
	}

	// Invalidate related caches
	go s.invalidateOrderCaches(ctx)

	// Track real-time metrics
	if eventType, ok := eventData["event_type"].(string); ok && eventType == "OrderCreated" {
		if amount, ok := eventData["total_amount"].(float64); ok {
			s.cache.TrackEvent(ctx, "order", map[string]interface{}{
				"amount": amount,
			})
		}
	}

	return nil
}

func (s *AnalyticsService) ProcessUserEvent(ctx context.Context, eventData map[string]interface{}) error {
	// Insert into ClickHouse
	err := s.db.InsertUserEvent(ctx, eventData)
	if err != nil {
		logrus.WithError(err).Error("Failed to insert user event")
		return fmt.Errorf("failed to insert user event: %w", err)
	}

	// Invalidate related caches
	go s.invalidateUserCaches(ctx)

	// Track real-time metrics
	if eventType, ok := eventData["event_type"].(string); ok && eventType == "UserCreated" {
		s.cache.TrackEvent(ctx, "user", nil)
	}

	return nil
}

func (s *AnalyticsService) ProcessProductEvent(ctx context.Context, eventData map[string]interface{}) error {
	// Insert into ClickHouse
	err := s.db.InsertProductEvent(ctx, eventData)
	if err != nil {
		logrus.WithError(err).Error("Failed to insert product event")
		return fmt.Errorf("failed to insert product event: %w", err)
	}

	// Invalidate related caches
	go s.invalidateProductCaches(ctx)

	// Track real-time metrics
	if eventType, ok := eventData["event_type"].(string); ok && eventType == "ProductViewed" {
		s.cache.TrackEvent(ctx, "view", nil)
	}

	return nil
}

// Cache invalidation helpers
func (s *AnalyticsService) invalidateOrderCaches(ctx context.Context) {
	patterns := []string{
		"analytics:orders:*",
		"analytics:revenue:*",
		"analytics:dashboard",
		"analytics:realtime",
		"analytics:trends:*",
	}

	for _, pattern := range patterns {
		if err := s.cache.DeletePattern(ctx, pattern); err != nil {
			logrus.WithError(err).WithField("pattern", pattern).Warn("Failed to invalidate cache pattern")
		}
	}
}

func (s *AnalyticsService) invalidateUserCaches(ctx context.Context) {
	patterns := []string{
		"analytics:users:*",
		"analytics:dashboard",
		"analytics:realtime",
		"analytics:trends:*",
	}

	for _, pattern := range patterns {
		if err := s.cache.DeletePattern(ctx, pattern); err != nil {
			logrus.WithError(err).WithField("pattern", pattern).Warn("Failed to invalidate cache pattern")
		}
	}
}

func (s *AnalyticsService) invalidateProductCaches(ctx context.Context) {
	patterns := []string{
		"analytics:products:*",
		"analytics:dashboard",
		"analytics:realtime",
		"analytics:trends:*",
	}

	for _, pattern := range patterns {
		if err := s.cache.DeletePattern(ctx, pattern); err != nil {
			logrus.WithError(err).WithField("pattern", pattern).Warn("Failed to invalidate cache pattern")
		}
	}
}

// Report generation
func (s *AnalyticsService) GenerateDailyReport(ctx context.Context, date time.Time) (map[string]interface{}, error) {
	from := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	to := from.Add(24 * time.Hour)

	orderAnalytics, err := s.db.GetOrderAnalytics(ctx, from, to)
	if err != nil {
		return nil, err
	}

	userAnalytics, err := s.db.GetUserAnalytics(ctx, from, to)
	if err != nil {
		return nil, err
	}

	productAnalytics, err := s.db.GetProductAnalytics(ctx, from, to, 10)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"date":             date.Format("2006-01-02"),
		"order_analytics":  orderAnalytics,
		"user_analytics":   userAnalytics,
		"product_analytics": productAnalytics,
		"generated_at":     time.Now(),
	}, nil
}

func (s *AnalyticsService) GenerateWeeklyReport(ctx context.Context, weekStart time.Time) (map[string]interface{}, error) {
	from := weekStart
	to := weekStart.Add(7 * 24 * time.Hour)

	orderAnalytics, err := s.db.GetOrderAnalytics(ctx, from, to)
	if err != nil {
		return nil, err
	}

	userAnalytics, err := s.db.GetUserAnalytics(ctx, from, to)
	if err != nil {
		return nil, err
	}

	revenueAnalytics, err := s.db.GetRevenueAnalytics(ctx, from, to, "day")
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"week_start":        weekStart.Format("2006-01-02"),
		"week_end":          to.Format("2006-01-02"),
		"order_analytics":   orderAnalytics,
		"user_analytics":    userAnalytics,
		"revenue_analytics": revenueAnalytics,
		"generated_at":      time.Now(),
	}, nil
}

func (s *AnalyticsService) GenerateMonthlyReport(ctx context.Context, monthStart time.Time) (map[string]interface{}, error) {
	from := monthStart
	to := monthStart.AddDate(0, 1, 0)

	orderAnalytics, err := s.db.GetOrderAnalytics(ctx, from, to)
	if err != nil {
		return nil, err
	}

	userAnalytics, err := s.db.GetUserAnalytics(ctx, from, to)
	if err != nil {
		return nil, err
	}

	productAnalytics, err := s.db.GetProductAnalytics(ctx, from, to, 20)
	if err != nil {
		return nil, err
	}

	revenueAnalytics, err := s.db.GetRevenueAnalytics(ctx, from, to, "week")
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"month":             monthStart.Format("2006-01"),
		"order_analytics":   orderAnalytics,
		"user_analytics":    userAnalytics,
		"product_analytics": productAnalytics,
		"revenue_analytics": revenueAnalytics,
		"generated_at":      time.Now(),
	}, nil
}
