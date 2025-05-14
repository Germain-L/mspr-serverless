package function

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pquerna/otp/totp"
)

const (
	// Durée de validité des identifiants (6 mois en secondes)
	CREDENTIALS_VALIDITY = 15552000 // 6 mois en secondes (180 * 24 * 60 * 60)
)

var (
	dbPool     *pgxpool.Pool
	encryptKey []byte
)

// User représente un utilisateur dans la base de données
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"-"` // Le mot de passe chiffré ne sera pas inclus dans les JSON responses
	MFA      string `json:"-"` // Le secret MFA chiffré ne sera pas inclus dans les JSON responses
	GenDate  int64  `json:"gen_date"`
	Expired  bool   `json:"expired"`
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

// decryptData déchiffre les données avec AES-256-GCM
func decryptData(encryptedData string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(encryptKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
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

	// Récupérer les identifiants
	username := r.FormValue("username")
	password := r.FormValue("password")
	totpCode := r.FormValue("totp_code")

	// Vérifier que tous les champs sont présents
	if username == "" || password == "" || totpCode == "" {
		http.Error(w, "Username, password and TOTP code are required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	// Récupérer l'utilisateur depuis la base de données
	var user User
	var encryptedPassword, encryptedMFA string

	err = dbPool.QueryRow(ctx,
		"SELECT id, username, password, mfa, gendate, expired FROM users WHERE username = $1",
		username).Scan(&user.ID, &user.Username, &encryptedPassword, &encryptedMFA, &user.GenDate, &user.Expired)

	if err != nil {
		log.Printf("ERROR: User not found or database error: %v", err)
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Vérifier si les identifiants sont expirés (plus de 6 mois)
	currentTime := time.Now().Unix()
	if currentTime-user.GenDate > CREDENTIALS_VALIDITY {
		// Marquer l'utilisateur comme expiré
		_, err = dbPool.Exec(ctx, "UPDATE users SET expired = true WHERE id = $1", user.ID)
		if err != nil {
			log.Printf("ERROR: Failed to mark user as expired: %v", err)
		}

		user.Expired = true
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		response := `{"error": "Credentials expired", "expired": true, "message": "Your credentials have expired. Please generate new password and 2FA."}`
		w.Write([]byte(response))
		return
	}

	// Si l'utilisateur est déjà marqué comme expiré
	if user.Expired {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		response := `{"error": "Credentials expired", "expired": true, "message": "Your credentials have expired. Please generate new password and 2FA."}`
		w.Write([]byte(response))
		return
	}

	// Déchiffrer le mot de passe stocké
	storedPassword, err := decryptData(encryptedPassword)
	if err != nil {
		log.Printf("ERROR: Failed to decrypt password: %v", err)
		http.Error(w, "Authentication error", http.StatusInternalServerError)
		return
	}

	// Vérifier si le mot de passe correspond
	if storedPassword != password {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Déchiffrer le secret MFA
	mfaSecret, err := decryptData(encryptedMFA)
	if err != nil {
		log.Printf("ERROR: Failed to decrypt MFA secret: %v", err)
		http.Error(w, "Authentication error", http.StatusInternalServerError)
		return
	}

	// Vérifier si le MFA est configuré
	if mfaSecret == "empty" {
		http.Error(w, "2FA not configured. Please generate 2FA first.", http.StatusUnauthorized)
		return
	}

	// Vérifier le code TOTP
	valid := totp.Validate(totpCode, mfaSecret)
	if !valid {
		http.Error(w, "Invalid TOTP code", http.StatusUnauthorized)
		return
	}

	// Authentification réussie
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := fmt.Sprintf(`{"status": "OK", "message": "Authentication successful", "user": {"id": %d, "username": "%s"}}`, user.ID, user.Username)
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
