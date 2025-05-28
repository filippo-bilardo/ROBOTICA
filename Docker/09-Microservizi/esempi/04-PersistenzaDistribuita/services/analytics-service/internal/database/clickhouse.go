package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"analytics-service/internal/config"

	_ "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/sirupsen/logrus"
)

type ClickHouse struct {
	db *sql.DB
}

type OrderAnalytics struct {
	Date             time.Time `json:"date"`
	TotalOrders      int64     `json:"total_orders"`
	TotalRevenue     float64   `json:"total_revenue"`
	AverageOrderSize float64   `json:"average_order_size"`
	TopProducts      []string  `json:"top_products"`
}

type UserAnalytics struct {
	Date           time.Time `json:"date"`
	NewUsers       int64     `json:"new_users"`
	ActiveUsers    int64     `json:"active_users"`
	ReturnUsers    int64     `json:"return_users"`
	AverageSession float64   `json:"average_session"`
}

type ProductAnalytics struct {
	ProductID    string  `json:"product_id"`
	ProductName  string  `json:"product_name"`
	Views        int64   `json:"views"`
	Orders       int64   `json:"orders"`
	Revenue      float64 `json:"revenue"`
	ConversionRate float64 `json:"conversion_rate"`
}

type RevenueAnalytics struct {
	Date     time.Time `json:"date"`
	Revenue  float64   `json:"revenue"`
	Orders   int64     `json:"orders"`
	Category string    `json:"category,omitempty"`
}

type DashboardData struct {
	TotalRevenue   float64           `json:"total_revenue"`
	TotalOrders    int64             `json:"total_orders"`
	TotalUsers     int64             `json:"total_users"`
	ActiveUsers    int64             `json:"active_users"`
	TopProducts    []ProductAnalytics `json:"top_products"`
	RecentOrders   []OrderAnalytics   `json:"recent_orders"`
	RevenueByDay   []RevenueAnalytics `json:"revenue_by_day"`
	UserGrowth     []UserAnalytics    `json:"user_growth"`
}

func NewClickHouse(cfg *config.Config) (*ClickHouse, error) {
	dsn := fmt.Sprintf("tcp://%s:%s?database=%s&username=%s&password=%s",
		cfg.ClickHouseHost,
		cfg.ClickHousePort,
		cfg.ClickHouseDB,
		cfg.ClickHouseUser,
		cfg.ClickHousePassword,
	)

	db, err := sql.Open("clickhouse", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open ClickHouse connection: %w", err)
	}

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping ClickHouse: %w", err)
	}

	logrus.Info("Connected to ClickHouse successfully")
	return &ClickHouse{db: db}, nil
}

func (ch *ClickHouse) Close() error {
	return ch.db.Close()
}

func (ch *ClickHouse) Ping() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return ch.db.PingContext(ctx)
}

// Order Analytics Queries
func (ch *ClickHouse) GetOrderAnalytics(ctx context.Context, from, to time.Time) ([]OrderAnalytics, error) {
	query := `
		SELECT 
			toDate(created_at) as date,
			count(*) as total_orders,
			sum(total_amount) as total_revenue,
			avg(total_amount) as average_order_size,
			groupArray(product_id) as top_products
		FROM order_events 
		WHERE event_type = 'OrderCreated' 
		AND created_at >= ? AND created_at <= ?
		GROUP BY toDate(created_at)
		ORDER BY date DESC
	`

	rows, err := ch.db.QueryContext(ctx, query, from, to)
	if err != nil {
		return nil, fmt.Errorf("failed to query order analytics: %w", err)
	}
	defer rows.Close()

	var results []OrderAnalytics
	for rows.Next() {
		var analytics OrderAnalytics
		var topProducts string
		
		err := rows.Scan(
			&analytics.Date,
			&analytics.TotalOrders,
			&analytics.TotalRevenue,
			&analytics.AverageOrderSize,
			&topProducts,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order analytics: %w", err)
		}

		results = append(results, analytics)
	}

	return results, nil
}

// User Analytics Queries
func (ch *ClickHouse) GetUserAnalytics(ctx context.Context, from, to time.Time) ([]UserAnalytics, error) {
	query := `
		SELECT 
			toDate(created_at) as date,
			countIf(event_type = 'UserCreated') as new_users,
			uniq(user_id) as active_users,
			countIf(event_type = 'UserLogin' AND user_last_login < created_at - interval 7 day) as return_users,
			avg(session_duration) as average_session
		FROM user_events 
		WHERE created_at >= ? AND created_at <= ?
		GROUP BY toDate(created_at)
		ORDER BY date DESC
	`

	rows, err := ch.db.QueryContext(ctx, query, from, to)
	if err != nil {
		return nil, fmt.Errorf("failed to query user analytics: %w", err)
	}
	defer rows.Close()

	var results []UserAnalytics
	for rows.Next() {
		var analytics UserAnalytics
		
		err := rows.Scan(
			&analytics.Date,
			&analytics.NewUsers,
			&analytics.ActiveUsers,
			&analytics.ReturnUsers,
			&analytics.AverageSession,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user analytics: %w", err)
		}

		results = append(results, analytics)
	}

	return results, nil
}

// Product Analytics Queries
func (ch *ClickHouse) GetProductAnalytics(ctx context.Context, from, to time.Time, limit int) ([]ProductAnalytics, error) {
	query := `
		SELECT 
			product_id,
			any(product_name) as product_name,
			countIf(event_type = 'ProductViewed') as views,
			countIf(event_type = 'OrderCreated') as orders,
			sumIf(total_amount, event_type = 'OrderCreated') as revenue,
			if(views > 0, orders / views * 100, 0) as conversion_rate
		FROM (
			SELECT product_id, product_name, event_type, 0 as total_amount, created_at
			FROM product_events 
			WHERE created_at >= ? AND created_at <= ?
			
			UNION ALL
			
			SELECT product_id, product_name, 'OrderCreated' as event_type, total_amount, created_at
			FROM order_events 
			WHERE created_at >= ? AND created_at <= ?
		)
		GROUP BY product_id
		ORDER BY revenue DESC
		LIMIT ?
	`

	rows, err := ch.db.QueryContext(ctx, query, from, to, from, to, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query product analytics: %w", err)
	}
	defer rows.Close()

	var results []ProductAnalytics
	for rows.Next() {
		var analytics ProductAnalytics
		
		err := rows.Scan(
			&analytics.ProductID,
			&analytics.ProductName,
			&analytics.Views,
			&analytics.Orders,
			&analytics.Revenue,
			&analytics.ConversionRate,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan product analytics: %w", err)
		}

		results = append(results, analytics)
	}

	return results, nil
}

// Revenue Analytics Queries
func (ch *ClickHouse) GetRevenueAnalytics(ctx context.Context, from, to time.Time, groupBy string) ([]RevenueAnalytics, error) {
	var timeGroup string
	switch groupBy {
	case "hour":
		timeGroup = "toHour(created_at)"
	case "day":
		timeGroup = "toDate(created_at)"
	case "week":
		timeGroup = "toMonday(created_at)"
	case "month":
		timeGroup = "toStartOfMonth(created_at)"
	default:
		timeGroup = "toDate(created_at)"
	}

	query := fmt.Sprintf(`
		SELECT 
			%s as date,
			sum(total_amount) as revenue,
			count(*) as orders,
			category
		FROM order_events 
		WHERE event_type = 'OrderCreated' 
		AND created_at >= ? AND created_at <= ?
		GROUP BY %s, category
		ORDER BY date DESC, revenue DESC
	`, timeGroup, timeGroup)

	rows, err := ch.db.QueryContext(ctx, query, from, to)
	if err != nil {
		return nil, fmt.Errorf("failed to query revenue analytics: %w", err)
	}
	defer rows.Close()

	var results []RevenueAnalytics
	for rows.Next() {
		var analytics RevenueAnalytics
		
		err := rows.Scan(
			&analytics.Date,
			&analytics.Revenue,
			&analytics.Orders,
			&analytics.Category,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan revenue analytics: %w", err)
		}

		results = append(results, analytics)
	}

	return results, nil
}

// Dashboard Data Query
func (ch *ClickHouse) GetDashboardData(ctx context.Context) (*DashboardData, error) {
	dashboard := &DashboardData{}
	
	// Get total revenue and orders (last 30 days)
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	
	revenueQuery := `
		SELECT 
			sum(total_amount) as total_revenue,
			count(*) as total_orders
		FROM order_events 
		WHERE event_type = 'OrderCreated' 
		AND created_at >= ?
	`
	
	err := ch.db.QueryRowContext(ctx, revenueQuery, thirtyDaysAgo).Scan(
		&dashboard.TotalRevenue,
		&dashboard.TotalOrders,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get revenue data: %w", err)
	}

	// Get user stats
	userQuery := `
		SELECT 
			count(DISTINCT user_id) as total_users,
			countIf(created_at >= ?) as active_users
		FROM user_events
	`
	
	err = ch.db.QueryRowContext(ctx, userQuery, thirtyDaysAgo).Scan(
		&dashboard.TotalUsers,
		&dashboard.ActiveUsers,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get user data: %w", err)
	}

	// Get top products (last 7 days)
	sevenDaysAgo := now.AddDate(0, 0, -7)
	topProducts, err := ch.GetProductAnalytics(ctx, sevenDaysAgo, now, 5)
	if err != nil {
		return nil, fmt.Errorf("failed to get top products: %w", err)
	}
	dashboard.TopProducts = topProducts

	// Get recent orders (last 7 days)
	recentOrders, err := ch.GetOrderAnalytics(ctx, sevenDaysAgo, now)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent orders: %w", err)
	}
	dashboard.RecentOrders = recentOrders

	// Get revenue by day (last 30 days)
	revenueByDay, err := ch.GetRevenueAnalytics(ctx, thirtyDaysAgo, now, "day")
	if err != nil {
		return nil, fmt.Errorf("failed to get revenue by day: %w", err)
	}
	dashboard.RevenueByDay = revenueByDay

	// Get user growth (last 30 days)
	userGrowth, err := ch.GetUserAnalytics(ctx, thirtyDaysAgo, now)
	if err != nil {
		return nil, fmt.Errorf("failed to get user growth: %w", err)
	}
	dashboard.UserGrowth = userGrowth

	return dashboard, nil
}

// Real-time metrics
func (ch *ClickHouse) GetRealtimeMetrics(ctx context.Context) (map[string]interface{}, error) {
	now := time.Now()
	oneHourAgo := now.Add(-time.Hour)

	query := `
		SELECT 
			countIf(event_type = 'OrderCreated' AND created_at >= ?) as orders_last_hour,
			countIf(event_type = 'UserCreated' AND created_at >= ?) as users_last_hour,
			countIf(event_type = 'ProductViewed' AND created_at >= ?) as views_last_hour,
			sumIf(total_amount, event_type = 'OrderCreated' AND created_at >= ?) as revenue_last_hour
		FROM (
			SELECT event_type, created_at, 0 as total_amount FROM user_events
			UNION ALL
			SELECT event_type, created_at, 0 as total_amount FROM product_events
			UNION ALL
			SELECT event_type, created_at, total_amount FROM order_events
		)
	`

	var ordersLastHour, usersLastHour, viewsLastHour int64
	var revenueLastHour float64

	err := ch.db.QueryRowContext(ctx, query, oneHourAgo, oneHourAgo, oneHourAgo, oneHourAgo).Scan(
		&ordersLastHour,
		&usersLastHour,
		&viewsLastHour,
		&revenueLastHour,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get realtime metrics: %w", err)
	}

	return map[string]interface{}{
		"orders_last_hour":  ordersLastHour,
		"users_last_hour":   usersLastHour,
		"views_last_hour":   viewsLastHour,
		"revenue_last_hour": revenueLastHour,
		"timestamp":         now,
	}, nil
}

// Trending analysis
func (ch *ClickHouse) GetTrends(ctx context.Context, days int) (map[string]interface{}, error) {
	from := time.Now().AddDate(0, 0, -days)
	to := time.Now()

	query := `
		SELECT 
			toDate(created_at) as date,
			countIf(event_type = 'OrderCreated') as daily_orders,
			sumIf(total_amount, event_type = 'OrderCreated') as daily_revenue,
			countIf(event_type = 'UserCreated') as daily_users
		FROM (
			SELECT event_type, created_at, 0 as total_amount FROM user_events WHERE created_at >= ? AND created_at <= ?
			UNION ALL
			SELECT event_type, created_at, total_amount FROM order_events WHERE created_at >= ? AND created_at <= ?
		)
		GROUP BY toDate(created_at)
		ORDER BY date
	`

	rows, err := ch.db.QueryContext(ctx, query, from, to, from, to)
	if err != nil {
		return nil, fmt.Errorf("failed to query trends: %w", err)
	}
	defer rows.Close()

	var dates []string
	var orders, users []int64
	var revenue []float64

	for rows.Next() {
		var date time.Time
		var dailyOrders, dailyUsers int64
		var dailyRevenue float64

		err := rows.Scan(&date, &dailyOrders, &dailyRevenue, &dailyUsers)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trends: %w", err)
		}

		dates = append(dates, date.Format("2006-01-02"))
		orders = append(orders, dailyOrders)
		revenue = append(revenue, dailyRevenue)
		users = append(users, dailyUsers)
	}

	return map[string]interface{}{
		"dates":   dates,
		"orders":  orders,
		"revenue": revenue,
		"users":   users,
		"period":  fmt.Sprintf("Last %d days", days),
	}, nil
}

// Insert event data
func (ch *ClickHouse) InsertOrderEvent(ctx context.Context, event map[string]interface{}) error {
	query := `
		INSERT INTO order_events (
			event_id, event_type, user_id, order_id, product_id, product_name,
			total_amount, quantity, category, status, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := ch.db.ExecContext(ctx, query,
		event["event_id"],
		event["event_type"],
		event["user_id"],
		event["order_id"],
		event["product_id"],
		event["product_name"],
		event["total_amount"],
		event["quantity"],
		event["category"],
		event["status"],
		event["created_at"],
	)

	return err
}

func (ch *ClickHouse) InsertUserEvent(ctx context.Context, event map[string]interface{}) error {
	query := `
		INSERT INTO user_events (
			event_id, event_type, user_id, user_email, user_name,
			session_duration, user_last_login, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := ch.db.ExecContext(ctx, query,
		event["event_id"],
		event["event_type"],
		event["user_id"],
		event["user_email"],
		event["user_name"],
		event["session_duration"],
		event["user_last_login"],
		event["created_at"],
	)

	return err
}

func (ch *ClickHouse) InsertProductEvent(ctx context.Context, event map[string]interface{}) error {
	query := `
		INSERT INTO product_events (
			event_id, event_type, user_id, product_id, product_name,
			category, search_query, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := ch.db.ExecContext(ctx, query,
		event["event_id"],
		event["event_type"],
		event["user_id"],
		event["product_id"],
		event["product_name"],
		event["category"],
		event["search_query"],
		event["created_at"],
	)

	return err
}
