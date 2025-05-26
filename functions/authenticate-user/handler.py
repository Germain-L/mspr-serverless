import os
import json
import bcrypt
import pyotp
import psycopg2
from psycopg2 import sql
from cryptography.fernet import Fernet, InvalidToken
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Constants
ACCOUNT_EXPIRY_DAYS = 180  # 6 months

def get_db_connection():
    """Create and return a database connection."""
    load_dotenv()
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except Exception as e:
        raise Exception(f"Failed to connect to database: {str(e)}")

def get_encryption_key():
    """Get the encryption key from environment variables."""
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        raise ValueError("ENCRYPTION_KEY environment variable not set")
    
    # Ensure the key is the correct length (32 bytes, base64-encoded)
    key = key.encode('utf-8')
    if len(key) != 44:  # 32 bytes = 44 base64 characters
        raise ValueError("ENCRYPTION_KEY must be 32 bytes, base64-encoded")
    
    return key

def decrypt_secret(encrypted_secret):
    """Decrypt the TOTP secret."""
    if not encrypted_secret:
        return None
        
    key = get_encryption_key()
    f = Fernet(key)
    try:
        decrypted = f.decrypt(encrypted_secret.encode('utf-8'))
        return decrypted.decode('utf-8')
    except InvalidToken:
        raise ValueError("Invalid encryption token")

def check_password(stored_password, provided_password):
    """Verify the provided password against the stored hash."""
    try:
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))
    except Exception as e:
        raise ValueError(f"Password verification failed: {str(e)}")

def verify_totp(secret, totp_code):
    """Verify the TOTP code against the secret."""
    if not secret or not totp_code:
        return False
    
    try:
        totp = pyotp.TOTP(secret)
        return totp.verify(totp_code, valid_window=1)  # Allow 1 step (30s) before/after
    except Exception as e:
        raise ValueError(f"TOTP verification failed: {str(e)}")

def is_account_expired(gendate_timestamp):
    """Check if the account has expired based on creation date."""
    if not gendate_timestamp:
        return True
        
    creation_date = datetime.fromtimestamp(gendate_timestamp / 1000, timezone.utc)
    expiry_date = creation_date + timedelta(days=ACCOUNT_EXPIRY_DAYS)
    return datetime.now(timezone.utc) > expiry_date

def handle(event, context):
    conn = None
    cursor = None
    try:
        # Parse incoming request
        try:
            body = json.loads(event.body) if hasattr(event, 'body') and event.body else {}
            username = body.get('username')
            password = body.get('password')
            totp_code = body.get('totp_code')
        except json.JSONDecodeError:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Invalid JSON in request body"})
            }
        
        # Validate input
        if not username or not password:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Username and password are required"})
            }
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get user data
        cursor.execute(
            """
            SELECT id, password, mfa, gendate, expired 
            FROM users 
            WHERE username = %s
            """,
            (username,)
        )
        user = cursor.fetchone()
        
        if not user:
            return {
                "statusCode": 401,
                "body": json.dumps({"error": "Invalid username or password"})
            }
        
        user_id, stored_password, encrypted_mfa, gendate, is_expired = user
        
        # Check password
        if not check_password(stored_password, password):
            return {
                "statusCode": 401,
                "body": json.dumps({"error": "Invalid username or password"})
            }
        
        # Check if 2FA is required
        if encrypted_mfa:
            if not totp_code:
                return {
                    "statusCode": 403,
                    "body": json.dumps({"error": "TOTP code is required"})
                }
            
            # Decrypt and verify TOTP
            try:
                mfa_secret = decrypt_secret(encrypted_mfa)
                if not verify_totp(mfa_secret, totp_code):
                    return {
                        "statusCode": 401,
                        "body": json.dumps({"error": "Invalid TOTP code"})
                    }
            except Exception as e:
                return {
                    "statusCode": 500,
                    "body": json.dumps({"error": f"TOTP verification failed: {str(e)}"})
                }
        
        # Check account expiration
        is_expired_by_time = is_account_expired(gendate)
        
        # Update expired status if needed
        if is_expired_by_time and not is_expired:
            update_query = """
                UPDATE users 
                SET expired = TRUE 
                WHERE id = %s
                RETURNING expired
            """
            cursor.execute(update_query, (user_id,))
            conn.commit()
            is_expired = True
        
        # Prepare response
        if is_expired or is_expired_by_time:
            return {
                "statusCode": 403,
                "body": json.dumps({
                    "status": "expired",
                    "message": "Account has expired. Please contact support."
                })
            }
        
        # Authentication successful
        return {
            "statusCode": 200,
            "body": json.dumps({
                "status": "success",
                "message": "Authentication successful",
                "user_id": user_id,
                "has_2fa": bool(encrypted_mfa)
            })
        }
        
    except Exception as e:
        if conn:
            conn.rollback()
        error_msg = str(e)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"An error occurred: {error_msg}"})
        }
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
