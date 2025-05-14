package function

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pquerna/otp/totp"
	"github.com/skip2/go-qrcode"
)

var (
	dbPool     *pgxpool.Pool
	encryptKey []byte
	qrCodeSize = 256
)

// QRResponse représente la réponse contenant un QR code
type QRResponse struct {
	QRCode  string `json:"qr_code"` // Base64 encoded QR code image
	Message string `json:"message"`
}

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

// initEncryptionKey initialise la clé de chiffrement depuis une variable d'environnement
func initEncryptionKey() error {
	var keyStr string
	if file := os.Getenv("ENCRYPTION_KEY_FILE"); file != "" {
		content, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("could not read ENCRYPTION_KEY_FILE: %w", err)
		}
		keyStr = string(content)
	} else {
		keyStr = os.Getenv("ENCRYPTION_KEY")
	}

	if keyStr == "" {
		return fmt.Errorf("encryption key not configured")
	}

	// Utilisation de SHA-256 pour obtenir une clé de 32 bytes (pour AES-256)
	hasher := sha256.New()
	hasher.Write([]byte(keyStr))
	encryptKey = hasher.Sum(nil)
	return nil
}

// encryptData chiffre les données avec AES-256-GCM
func encryptData(data string) (string, error) {
	block, err := aes.NewCipher(encryptKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(data), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// generateQRCode génère un QR code à partir d'une chaîne et le renvoie en base64
func generateQRCode(content string) (string, error) {
	qr, err := qrcode.Encode(content, qrcode.Medium, qrCodeSize)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(qr), nil
}

// Handle is the entry point for the function
func Handle(w http.ResponseWriter, r *http.Request) {
	// Initialiser la clé de chiffrement
	if err := initEncryptionKey(); err != nil {
		log.Printf("ERROR: Failed to initialize encryption key: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Connecter à la base de données
	var err error
	dbPool, err = ConnectDB()
	if err != nil {
		log.Printf("ERROR: Failed to connect to database: %v", err)
		http.Error(w, "Database connection error", http.StatusServiceUnavailable)
		return
	}

	// Supporter uniquement les requêtes POST
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Limiter la taille de la requête
	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	// Décoder le corps de la requête
	err = r.ParseForm()
	if err != nil {
		http.Error(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	// Récupérer le nom d'utilisateur
	username := r.FormValue("username")
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Vérifier si l'utilisateur existe
	var userExists bool
	err = dbPool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", username).Scan(&userExists)
	if err != nil {
		log.Printf("ERROR: Failed to check if user exists: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if !userExists {
		http.Error(w, "User not found. Generate a password first.", http.StatusNotFound)
		return
	}

	// Générer un nouveau secret TOTP
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "registry.germainleignel.com/library",
		AccountName: username,
	})
	if err != nil {
		log.Printf("ERROR: Failed to generate TOTP key: %v", err)
		http.Error(w, "Failed to generate 2FA secret", http.StatusInternalServerError)
		return
	}

	// Chiffrer le secret
	encryptedSecret, err := encryptData(key.Secret())
	if err != nil {
		log.Printf("ERROR: Failed to encrypt TOTP secret: %v", err)
		http.Error(w, "Failed to process 2FA secret", http.StatusInternalServerError)
		return
	}

	// Mettre à jour l'utilisateur avec le nouveau secret MFA
	_, err = dbPool.Exec(ctx, "UPDATE users SET mfa = $1 WHERE username = $2", encryptedSecret, username)
	if err != nil {
		log.Printf("ERROR: Failed to update user MFA: %v", err)
		http.Error(w, "Failed to save 2FA data", http.StatusInternalServerError)
		return
	}

	// Générer le QR code pour le 2FA
	qrCode, err := generateQRCode(key.URL())
	if err != nil {
		log.Printf("ERROR: Failed to generate QR code: %v", err)
		http.Error(w, "Failed to generate QR code", http.StatusInternalServerError)
		return
	}

	// Renvoyer la réponse au format JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := fmt.Sprintf(`{"qr_code": "%s", "message": "2FA secret generated successfully. Scan QR code with your authenticator app."}`, qrCode)
	w.Write([]byte(response))
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
