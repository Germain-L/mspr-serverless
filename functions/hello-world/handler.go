package function

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

var dbPool *pgxpool.Pool

// ConnectDB initializes the database connection pool
func ConnectDB() (*pgxpool.Pool, error) {
	var dbURL string
	if file := os.Getenv("DATABASE_URL_FILE"); file != "" {
		content, err := os.ReadFile(file)
		if err != nil {
			log.Printf("WARNING: Could not read DATABASE_URL_FILE %s: %v", file, err)
		} else {
			dbURL = string(content)
		}
	} else {
		dbURL = os.Getenv("DATABASE_URL")
	}
	if dbURL == "" {
		log.Println("WARNING: Database URL not configured via DATABASE_URL or DATABASE_URL_FILE.")
		return nil, fmt.Errorf("database URL not configured")
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return nil, fmt.Errorf("unable to parse DATABASE_URL: %w", err)
	}

	config.MaxConns = int32(getEnvAsInt("DB_MAX_CONNS", 10))
	config.MinConns = int32(getEnvAsInt("DB_MIN_CONNS", 2))
	config.MaxConnLifetime = getEnvAsDuration("DB_MAX_CONN_LIFETIME", time.Hour)
	config.MaxConnIdleTime = getEnvAsDuration("DB_MAX_CONN_IDLE_TIME", 30*time.Minute)
	config.HealthCheckPeriod = getEnvAsDuration("DB_HEALTH_CHECK_PERIOD", time.Minute)
	config.ConnConfig.ConnectTimeout = getEnvAsDuration("DB_CONNECT_TIMEOUT", 5*time.Second)

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}

	log.Println("Database connection pool established successfully.")
	return pool, nil
}

// Handle is the entry point for the function using Gin
func Handle() {
	var err error
	dbPool, err = ConnectDB()
	if err != nil {
		log.Printf("ERROR: Failed to connect to database on startup: %v", err)
	}

	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK", "message": "Welcome to the Go Gin/pgx function!"})
	})

	router.GET("/db-ping", func(c *gin.Context) {
		if dbPool == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Database not connected"})
			return
		}
		ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
		defer cancel()

		if err := dbPool.Ping(ctx); err != nil {
			log.Printf("ERROR: Failed to ping database: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to ping database", "details": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "OK", "message": "Database ping successful"})
	})

	port := os.Getenv("gin_port")
	if port == "" {
		port = "8081"
	}
	addr := fmt.Sprintf(":%s", port)

	log.Printf("Gin server listening on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to run Gin server: %v", err)
	}
}

// Helper functions
func getEnvAsInt(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	var i int
	_, err := fmt.Sscan(val, &i)
	if err != nil {
		log.Printf("Warning: Could not parse env var %s as int: %v. Using fallback %d.", key, err, fallback)
		return fallback
	}
	return i
}

func getEnvAsDuration(key string, fallback time.Duration) time.Duration {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	d, err := time.ParseDuration(val)
	if err != nil {
		log.Printf("Warning: Could not parse env var %s as duration: %v. Using fallback %s.", key, err, fallback)
		return fallback
	}
	return d
}

func main() {
	Handle()
}
