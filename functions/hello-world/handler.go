package function

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

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

// Handle is the entry point for the function
func Handle(w http.ResponseWriter, r *http.Request) {
	// Initialize database connection
	var err error
	if dbPool == nil {
		dbPool, err = ConnectDB()
		if err != nil {
			log.Printf("ERROR: Failed to connect to database: %v", err)
		}
	}

	// Handle different paths
	switch r.URL.Path {
	case "/", "":
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "OK", "message": "Welcome to the Go function!"}`))

	case "/db-ping":
		if dbPool == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"error": "Database not connected"}`))
			return
		}

		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()

		if err := dbPool.Ping(ctx); err != nil {
			log.Printf("ERROR: Failed to ping database: %v", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte(fmt.Sprintf(`{"error": "Failed to ping database", "details": "%s"}`, err.Error())))
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "OK", "message": "Database ping successful"}`))

	default:
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error": "Path not found"}`))
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
