package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"analytics-service/internal/config"

	"github.com/go-redis/redis/v8"
	"github.com/sirupsen/logrus"
)

type Client struct {
	rdb *redis.Client
}

func NewClient(cfg *config.Config) (*Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	logrus.Info("Connected to Redis successfully")
	return &Client{rdb: rdb}, nil
}

func (c *Client) Close() error {
	return c.rdb.Close()
}

func (c *Client) Ping() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return c.rdb.Ping(ctx).Err()
}

// Cache operations for analytics data
func (c *Client) SetCache(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal cache data: %w", err)
	}

	return c.rdb.Set(ctx, key, data, expiration).Err()
}

func (c *Client) GetCache(ctx context.Context, key string, dest interface{}) error {
	data, err := c.rdb.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("cache miss for key: %s", key)
		}
		return fmt.Errorf("failed to get cache: %w", err)
	}

	return json.Unmarshal([]byte(data), dest)
}

func (c *Client) DeleteCache(ctx context.Context, key string) error {
	return c.rdb.Del(ctx, key).Err()
}

func (c *Client) DeletePattern(ctx context.Context, pattern string) error {
	keys, err := c.rdb.Keys(ctx, pattern).Result()
	if err != nil {
		return fmt.Errorf("failed to get keys for pattern %s: %w", pattern, err)
	}

	if len(keys) > 0 {
		return c.rdb.Del(ctx, keys...).Err()
	}

	return nil
}

// Real-time counters
func (c *Client) IncrementCounter(ctx context.Context, key string, expiration time.Duration) (int64, error) {
	pipe := c.rdb.Pipeline()
	
	incrCmd := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, expiration)
	
	_, err := pipe.Exec(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to increment counter: %w", err)
	}

	return incrCmd.Val(), nil
}

func (c *Client) GetCounter(ctx context.Context, key string) (int64, error) {
	val, err := c.rdb.Get(ctx, key).Int64()
	if err != nil {
		if err == redis.Nil {
			return 0, nil
		}
		return 0, fmt.Errorf("failed to get counter: %w", err)
	}
	return val, nil
}

// Sliding window for real-time metrics
func (c *Client) AddToTimeSeries(ctx context.Context, key string, timestamp time.Time, value float64, windowSize time.Duration) error {
	pipe := c.rdb.Pipeline()
	
	// Add the new value
	pipe.ZAdd(ctx, key, &redis.Z{
		Score:  float64(timestamp.Unix()),
		Member: fmt.Sprintf("%d:%f", timestamp.Unix(), value),
	})
	
	// Remove old entries outside the window
	cutoff := timestamp.Add(-windowSize).Unix()
	pipe.ZRemRangeByScore(ctx, key, "-inf", fmt.Sprintf("%d", cutoff))
	
	// Set expiration
	pipe.Expire(ctx, key, windowSize+time.Hour)
	
	_, err := pipe.Exec(ctx)
	return err
}

func (c *Client) GetTimeSeriesSum(ctx context.Context, key string, from, to time.Time) (float64, error) {
	members, err := c.rdb.ZRangeByScore(ctx, key, &redis.ZRangeBy{
		Min: fmt.Sprintf("%d", from.Unix()),
		Max: fmt.Sprintf("%d", to.Unix()),
	}).Result()
	
	if err != nil {
		return 0, fmt.Errorf("failed to get time series data: %w", err)
	}

	var sum float64
	for _, member := range members {
		var timestamp int64
		var value float64
		_, err := fmt.Sscanf(member, "%d:%f", &timestamp, &value)
		if err == nil {
			sum += value
		}
	}

	return sum, nil
}

// Analytics cache keys
func (c *Client) GetAnalyticsCacheKey(prefix, params string) string {
	return fmt.Sprintf("analytics:%s:%s", prefix, params)
}

func (c *Client) GetDashboardCacheKey() string {
	return "analytics:dashboard"
}

func (c *Client) GetRealtimeCacheKey() string {
	return "analytics:realtime"
}

// Event tracking
func (c *Client) TrackEvent(ctx context.Context, eventType string, metadata map[string]interface{}) error {
	timestamp := time.Now()
	
	// Track event count
	hourKey := fmt.Sprintf("events:%s:hour:%s", eventType, timestamp.Format("2006010215"))
	_, err := c.IncrementCounter(ctx, hourKey, 25*time.Hour) // Keep for 25 hours
	if err != nil {
		return err
	}

	// Track event details in time series if needed
	if eventType == "order" {
		if amount, ok := metadata["amount"].(float64); ok {
			timeSeriesKey := fmt.Sprintf("revenue:hour:%s", timestamp.Format("2006010215"))
			return c.AddToTimeSeries(ctx, timeSeriesKey, timestamp, amount, 24*time.Hour)
		}
	}

	return nil
}

// Leaderboards for analytics
func (c *Client) UpdateLeaderboard(ctx context.Context, leaderboard, member string, score float64) error {
	return c.rdb.ZAdd(ctx, leaderboard, &redis.Z{
		Score:  score,
		Member: member,
	}).Err()
}

func (c *Client) GetTopFromLeaderboard(ctx context.Context, leaderboard string, count int64) ([]redis.Z, error) {
	return c.rdb.ZRevRangeWithScores(ctx, leaderboard, 0, count-1).Result()
}

// Health metrics
func (c *Client) SetHealthMetric(ctx context.Context, service, metric string, value interface{}) error {
	key := fmt.Sprintf("health:%s:%s", service, metric)
	return c.rdb.Set(ctx, key, value, 5*time.Minute).Err()
}

func (c *Client) GetHealthMetrics(ctx context.Context, service string) (map[string]string, error) {
	pattern := fmt.Sprintf("health:%s:*", service)
	keys, err := c.rdb.Keys(ctx, pattern).Result()
	if err != nil {
		return nil, err
	}

	if len(keys) == 0 {
		return map[string]string{}, nil
	}

	values, err := c.rdb.MGet(ctx, keys...).Result()
	if err != nil {
		return nil, err
	}

	result := make(map[string]string)
	for i, key := range keys {
		if values[i] != nil {
			result[key] = fmt.Sprintf("%v", values[i])
		}
	}

	return result, nil
}
