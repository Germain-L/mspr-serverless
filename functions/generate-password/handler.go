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
	"math/big"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/skip2/go-qrcode"
)

const (
	// Complexité du mot de passe
	PASSWORD_LENGTH = 24
)

var (
	dbPool       *pgxpool.Pool
	encryptKey   []byte
	qrCodeSize   = 256
	specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?"
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

	// Ensure table exists
	err = createTableIfNotExists(pool)
	if err != nil {
		log.Printf("ERROR: Failed to create table: %v", err)
		return nil, err
	}

	log.Println("Database connection pool established successfully.")
	return pool, nil
}

// createTableIfNotExists crée la table users si elle n'existe pas
func createTableIfNotExists(pool *pgxpool.Pool) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	createTableSQL := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(100) UNIQUE NOT NULL,
		password TEXT NOT NULL,
		mfa TEXT NOT NULL,
		gendate BIGINT NOT NULL,
		expired BOOLEAN NOT NULL DEFAULT FALSE
	);`

	_, err := pool.Exec(ctx, createTableSQL)
	return err
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

// generatePassword génère un mot de passe aléatoire avec la complexité requise
func generatePassword() (string, error) {
	const (
		lowerChars = "abcdefghijklmnopqrstuvwxyz"
		upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		numChars   = "0123456789"
	)

	// Garantir au moins un caractère de chaque type
	password := make([]byte, PASSWORD_LENGTH)

	// Ajouter au moins un caractère de chaque catégorie
	if _, err := rand.Read(password); err != nil {
		return "", err
	}

	// Garantir au moins un caractère de chaque type
	categories := []string{lowerChars, upperChars, numChars, specialChars}
	for i, category := range categories {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(category))))
		if err != nil {
			return "", err
		}
		password[i] = category[n.Int64()]
	}

	// Remplir le reste aléatoirement
	allChars := lowerChars + upperChars + numChars + specialChars
	for i := len(categories); i < PASSWORD_LENGTH; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(allChars))))
		if err != nil {
			return "", err
		}
		password[i] = allChars[n.Int64()]
	}

	// Mélanger le mot de passe
	for i := range password {
		j, err := rand.Int(rand.Reader, big.NewInt(int64(len(password))))
		if err != nil {
			return "", err
		}
		password[i], password[j.Int64()] = password[j.Int64()], password[i]
	}

	return string(password), nil
}

// generateQRCode génère un QR code à partir d'une chaîne et le renvoie en base64
func generateQRCode(content string) (string, error) {
	qr, err := qrcode.Encode(content, qrcode.Medium, qrCodeSize)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(qr), nil
}

// Handle is the entry point for the function using Gin
func Handle(w http.ResponseWriter, r *http.Request) {
	// Pour OpenFaaS, on doit utiliser le format standard HTTP
	// Si besoin de Gin, il faudrait adapter

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

	// Générer un mot de passe
	password, err := generatePassword()
	if err != nil {
		log.Printf("ERROR: Failed to generate password: %v", err)
		http.Error(w, "Failed to generate password", http.StatusInternalServerError)
		return
	}

	// Chiffrer le mot de passe
	encryptedPassword, err := encryptData(password)
	if err != nil {
		log.Printf("ERROR: Failed to encrypt password: %v", err)
		http.Error(w, "Failed to process password", http.StatusInternalServerError)
		return
	}

	// Générer un QR code pour le mot de passe
	qrContent := fmt.Sprintf("registry.germainleignel.com/library:Password:%s:%s", username, password)
	qrCode, err := generateQRCode(qrContent)
	if err != nil {
		log.Printf("ERROR: Failed to generate QR code: %v", err)
		http.Error(w, "Failed to generate QR code", http.StatusInternalServerError)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Vérifier si l'utilisateur existe déjà
	var userExists bool
	err = dbPool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", username).Scan(&userExists)
	if err != nil {
		log.Printf("ERROR: Failed to check if user exists: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	currentTime := time.Now().Unix()

	if userExists {
		// Mettre à jour le mot de passe de l'utilisateur
		_, err = dbPool.Exec(ctx,
			"UPDATE users SET password = $1, gendate = $2, expired = false WHERE username = $3",
			encryptedPassword, currentTime, username)
	} else {
		// Créer un nouvel utilisateur avec un MFA vide (sera défini plus tard)
		emptyMFA, err := encryptData("empty")
		if err != nil {
			log.Printf("ERROR: Failed to create empty MFA: %v", err)
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		_, err = dbPool.Exec(ctx,
			"INSERT INTO users (username, password, mfa, gendate, expired) VALUES ($1, $2, $3, $4, false)",
			username, encryptedPassword, emptyMFA, currentTime)
	}

	if err != nil {
		log.Printf("ERROR: Failed to save user: %v", err)
		http.Error(w, "Failed to save user data", http.StatusInternalServerError)
		return
	}

	// Renvoyer la réponse au format JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := fmt.Sprintf(`{"qr_code": "%s", "message": "Password generated successfully. Scan QR code to get your password."}`, qrCode)
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
