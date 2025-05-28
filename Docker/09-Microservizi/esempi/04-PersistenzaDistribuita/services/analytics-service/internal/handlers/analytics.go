package handlers

import (
	"net/http"
	"strconv"
	"time"

	"analytics-service/internal/database"
	"analytics-service/internal/redis"
	"analytics-service/internal/services"
	"analytics-service/internal/tracing"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type AnalyticsHandler struct {
	service *services.AnalyticsService
}

func NewAnalyticsHandler(service *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{service: service}
}

// @Summary Get order analytics
// @Description Get order analytics data for a date range
// @Tags analytics
// @Accept json
// @Produce json
// @Param from query string true "Start date (YYYY-MM-DD)"
// @Param to query string true "End date (YYYY-MM-DD)"
// @Success 200 {array} database.OrderAnalytics
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/analytics/orders [get]
func (h *AnalyticsHandler) GetOrderAnalytics(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
	}

	// Parse date parameters
	fromStr := c.Query("from")
	toStr := c.Query("to")

	if fromStr == "" || toStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "from and to parameters are required"})
		return
	}

	from, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from date format"})
		return
	}

	to, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to date format"})
		return
	}

	// Add tracing tags
	if span != nil {
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "order_analytics",
			"from_date":  fromStr,
			"to_date":    toStr,
		})
	}

	result, err := h.service.GetOrderAnalytics(c.Request.Context(), from, to, span)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to get order analytics")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  result,
		"from":  fromStr,
		"to":    toStr,
		"count": len(result),
	})
}

// @Summary Get user analytics
// @Description Get user analytics data for a date range
// @Tags analytics
// @Accept json
// @Produce json
// @Param from query string true "Start date (YYYY-MM-DD)"
// @Param to query string true "End date (YYYY-MM-DD)"
// @Success 200 {array} database.UserAnalytics
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/analytics/users [get]
func (h *AnalyticsHandler) GetUserAnalytics(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
	}

	fromStr := c.Query("from")
	toStr := c.Query("to")

	if fromStr == "" || toStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "from and to parameters are required"})
		return
	}

	from, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from date format"})
		return
	}

	to, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to date format"})
		return
	}

	if span != nil {
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "user_analytics",
			"from_date":  fromStr,
			"to_date":    toStr,
		})
	}

	result, err := h.service.GetUserAnalytics(c.Request.Context(), from, to, span)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to get user analytics")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  result,
		"from":  fromStr,
		"to":    toStr,
		"count": len(result),
	})
}

// @Summary Get product analytics
// @Description Get product analytics data for a date range
// @Tags analytics
// @Accept json
// @Produce json
// @Param from query string true "Start date (YYYY-MM-DD)"
// @Param to query string true "End date (YYYY-MM-DD)"
// @Param limit query int false "Number of products to return" default(20)
// @Success 200 {array} database.ProductAnalytics
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/analytics/products [get]
func (h *AnalyticsHandler) GetProductAnalytics(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
	}

	fromStr := c.Query("from")
	toStr := c.Query("to")
	limitStr := c.DefaultQuery("limit", "20")

	if fromStr == "" || toStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "from and to parameters are required"})
		return
	}

	from, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from date format"})
		return
	}

	to, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to date format"})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 20
	}

	if span != nil {
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "product_analytics",
			"from_date":  fromStr,
			"to_date":    toStr,
			"limit":      limit,
		})
	}

	result, err := h.service.GetProductAnalytics(c.Request.Context(), from, to, limit, span)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to get product analytics")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  result,
		"from":  fromStr,
		"to":    toStr,
		"limit": limit,
		"count": len(result),
	})
}

// @Summary Get revenue analytics
// @Description Get revenue analytics data for a date range
// @Tags analytics
// @Accept json
// @Produce json
// @Param from query string true "Start date (YYYY-MM-DD)"
// @Param to query string true "End date (YYYY-MM-DD)"
// @Param group_by query string false "Group by: hour, day, week, month" default(day)
// @Success 200 {array} database.RevenueAnalytics
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/analytics/revenue [get]
func (h *AnalyticsHandler) GetRevenueAnalytics(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
	}

	fromStr := c.Query("from")
	toStr := c.Query("to")
	groupBy := c.DefaultQuery("group_by", "day")

	if fromStr == "" || toStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "from and to parameters are required"})
		return
	}

	from, err := time.Parse("2006-01-02", fromStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from date format"})
		return
	}

	to, err := time.Parse("2006-01-02", toStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to date format"})
		return
	}

	// Validate groupBy parameter
	validGroupBy := map[string]bool{
		"hour": true, "day": true, "week": true, "month": true,
	}
	if !validGroupBy[groupBy] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid group_by parameter"})
		return
	}

	if span != nil {
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "revenue_analytics",
			"from_date":  fromStr,
			"to_date":    toStr,
			"group_by":   groupBy,
		})
	}

	result, err := h.service.GetRevenueAnalytics(c.Request.Context(), from, to, groupBy, span)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to get revenue analytics")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":     result,
		"from":     fromStr,
		"to":       toStr,
		"group_by": groupBy,
		"count":    len(result),
	})
}

// @Summary Get dashboard data
// @Description Get comprehensive dashboard data
// @Tags analytics
// @Accept json
// @Produce json
// @Success 200 {object} database.DashboardData
// @Failure 500 {object} map[string]string
// @Router /api/v1/analytics/dashboard [get]
func (h *AnalyticsHandler) GetDashboardData(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "dashboard",
		})
	}

	result, err := h.service.GetDashboardData(c.Request.Context(), span)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to get dashboard data")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":         result,
		"generated_at": time.Now(),
	})
}

// @Summary Get real-time metrics
// @Description Get real-time metrics for the last hour
// @Tags metrics
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /api/v1/metrics/realtime [get]
func (h *AnalyticsHandler) GetRealtimeMetrics(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "realtime_metrics",
		})
	}

	result, err := h.service.GetRealtimeMetrics(c.Request.Context(), span)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to get realtime metrics")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": result,
	})
}

// @Summary Get trends
// @Description Get trend analysis for specified number of days
// @Tags analytics
// @Accept json
// @Produce json
// @Param days query int false "Number of days" default(30)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/metrics/trends [get]
func (h *AnalyticsHandler) GetTrends(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
	}

	daysStr := c.DefaultQuery("days", "30")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 || days > 365 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid days parameter (1-365)"})
		return
	}

	if span != nil {
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "trends",
			"days":       days,
		})
	}

	result, err := h.service.GetTrends(c.Request.Context(), days, span)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to get trends")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": result,
		"days": days,
	})
}

// @Summary Get daily report
// @Description Generate daily analytics report
// @Tags reports
// @Accept json
// @Produce json
// @Param date query string true "Date (YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/reports/daily [get]
func (h *AnalyticsHandler) GetDailyReport(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
	}

	dateStr := c.Query("date")
	if dateStr == "" {
		dateStr = time.Now().Format("2006-01-02")
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
		return
	}

	if span != nil {
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "daily_report",
			"date":       dateStr,
		})
	}

	result, err := h.service.GenerateDailyReport(c.Request.Context(), date)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to generate daily report")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary Get weekly report
// @Description Generate weekly analytics report
// @Tags reports
// @Accept json
// @Produce json
// @Param week_start query string true "Week start date (YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/reports/weekly [get]
func (h *AnalyticsHandler) GetWeeklyReport(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
	}

	weekStartStr := c.Query("week_start")
	if weekStartStr == "" {
		// Default to start of current week (Monday)
		now := time.Now()
		weekday := int(now.Weekday())
		if weekday == 0 {
			weekday = 7 // Sunday = 7
		}
		weekStart := now.AddDate(0, 0, -(weekday-1))
		weekStartStr = weekStart.Format("2006-01-02")
	}

	weekStart, err := time.Parse("2006-01-02", weekStartStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid week_start date format"})
		return
	}

	if span != nil {
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "weekly_report",
			"week_start": weekStartStr,
		})
	}

	result, err := h.service.GenerateWeeklyReport(c.Request.Context(), weekStart)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to generate weekly report")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary Get monthly report
// @Description Generate monthly analytics report
// @Tags reports
// @Accept json
// @Produce json
// @Param month query string true "Month (YYYY-MM)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/reports/monthly [get]
func (h *AnalyticsHandler) GetMonthlyReport(c *gin.Context) {
	span := tracing.SpanFromContext(c)
	if span != nil {
		defer span.Finish()
	}

	monthStr := c.Query("month")
	if monthStr == "" {
		monthStr = time.Now().Format("2006-01")
	}

	monthStart, err := time.Parse("2006-01", monthStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid month format (YYYY-MM)"})
		return
	}

	if span != nil {
		tracing.SetTags(span, map[string]interface{}{
			"query_type": "monthly_report",
			"month":      monthStr,
		})
	}

	result, err := h.service.GenerateMonthlyReport(c.Request.Context(), monthStart)
	if err != nil {
		if span != nil {
			tracing.LogError(span, err)
		}
		logrus.WithError(err).Error("Failed to generate monthly report")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// Health check handlers
func HealthCheck(db *database.ClickHouse, cache *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		status := "healthy"
		checks := make(map[string]string)

		// Check ClickHouse
		if err := db.Ping(); err != nil {
			status = "unhealthy"
			checks["clickhouse"] = "down"
		} else {
			checks["clickhouse"] = "up"
		}

		// Check Redis
		if err := cache.Ping(); err != nil {
			status = "unhealthy"
			checks["redis"] = "down"
		} else {
			checks["redis"] = "up"
		}

		statusCode := http.StatusOK
		if status == "unhealthy" {
			statusCode = http.StatusServiceUnavailable
		}

		c.JSON(statusCode, gin.H{
			"status": status,
			"checks": checks,
			"timestamp": time.Now(),
		})
	}
}

func ReadinessCheck(db *database.ClickHouse, cache *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ready := true
		checks := make(map[string]string)

		// Check ClickHouse
		if err := db.Ping(); err != nil {
			ready = false
			checks["clickhouse"] = "not ready"
		} else {
			checks["clickhouse"] = "ready"
		}

		// Check Redis
		if err := cache.Ping(); err != nil {
			ready = false
			checks["redis"] = "not ready"
		} else {
			checks["redis"] = "ready"
		}

		status := "ready"
		statusCode := http.StatusOK
		if !ready {
			status = "not ready"
			statusCode = http.StatusServiceUnavailable
		}

		c.JSON(statusCode, gin.H{
			"status": status,
			"checks": checks,
			"timestamp": time.Now(),
		})
	}
}
