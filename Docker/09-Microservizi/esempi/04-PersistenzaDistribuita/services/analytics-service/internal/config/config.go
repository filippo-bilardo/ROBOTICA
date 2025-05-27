package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

type Config struct {
	// Service settings
	ServiceName string
	Port        string
	LogLevel    string

	// ClickHouse settings
	ClickHouseHost     string
	ClickHousePort     string
	ClickHouseDB       string
	ClickHouseUser     string
	ClickHousePassword string

	// Redis settings
	RedisHost     string
	RedisPort     string
	RedisPassword string
	RedisDB       int

	// Kafka settings
	KafkaBrokers   []string
	KafkaGroupID   string
	KafkaTopics    []string

	// Monitoring settings
	JaegerEndpoint string
	JaegerSampler  float64

	// Analytics settings
	CacheExpiration int
	BatchSize       int
	FlushInterval   int
}

func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		logrus.Warn("No .env file found")
	}

	cfg := &Config{
		ServiceName: getEnv("SERVICE_NAME", "analytics-service"),
		Port:        getEnv("PORT", "8080"),
		LogLevel:    getEnv("LOG_LEVEL", "info"),

		ClickHouseHost:     getEnv("CLICKHOUSE_HOST", "clickhouse"),
		ClickHousePort:     getEnv("CLICKHOUSE_PORT", "9000"),
		ClickHouseDB:       getEnv("CLICKHOUSE_DB", "microservices_analytics"),
		ClickHouseUser:     getEnv("CLICKHOUSE_USER", "default"),
		ClickHousePassword: getEnv("CLICKHOUSE_PASSWORD", ""),

		RedisHost:     getEnv("REDIS_HOST", "redis"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getEnvAsInt("REDIS_DB", 2),

		KafkaBrokers: getEnvAsSlice("KAFKA_BROKERS", []string{"kafka:9092"}),
		KafkaGroupID: getEnv("KAFKA_GROUP_ID", "analytics-service-group"),
		KafkaTopics: getEnvAsSlice("KAFKA_TOPICS", []string{
			"microservices.user.created",
			"microservices.user.updated",
			"microservices.order.created",
			"microservices.order.updated",
			"microservices.product.viewed",
			"microservices.product.searched",
		}),

		JaegerEndpoint: getEnv("JAEGER_ENDPOINT", "http://jaeger:14268/api/traces"),
		JaegerSampler:  getEnvAsFloat("JAEGER_SAMPLER", 1.0),

		CacheExpiration: getEnvAsInt("CACHE_EXPIRATION", 300), // 5 minutes
		BatchSize:       getEnvAsInt("BATCH_SIZE", 1000),
		FlushInterval:   getEnvAsInt("FLUSH_INTERVAL", 10), // 10 seconds
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvAsFloat(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatValue, err := strconv.ParseFloat(value, 64); err == nil {
			return floatValue
		}
	}
	return defaultValue
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		// Simple implementation - split by comma
		// In production, consider using a proper CSV parser
		result := []string{}
		for _, item := range defaultValue {
			result = append(result, item)
		}
		return result
	}
	return defaultValue
}
