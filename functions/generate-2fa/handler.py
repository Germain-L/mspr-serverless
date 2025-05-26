import os
import json
import base64
import pyotp
import qrcode
import io
import psycopg2
from psycopg2 import sql
from cryptography.fernet import Fernet
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment variables at module level
load_dotenv()

def get_db_connection():
    """Create and return a database connection."""
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

def encrypt_secret(secret):
    """Encrypt the TOTP secret before storing it."""
    key = get_encryption_key()
    f = Fernet(key)
    encrypted = f.encrypt(secret.encode('utf-8'))
    return encrypted.decode('utf-8')

def create_qr_code(data):
    """Create a QR code and return it as a base64 encoded string."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def handle(event, context):
    conn = None
    cursor = None
    try:
        # Parse incoming request
        try:
            body = json.loads(event.body) if hasattr(event, 'body') and event.body else {}
            username = body.get('username')
        except json.JSONDecodeError:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Invalid JSON in request body"})
            }
        
        if not username:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Username is required"})
            }
        
        # Generate a new TOTP secret
        secret = pyotp.random_base32()
        
        # Encrypt the secret before storing
        encrypted_secret = encrypt_secret(secret)
        
        # Create TOTP URI for QR code
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=username,
            issuer_name="COFRAP"
        )
        
        # Generate QR code
        qr_code_base64 = create_qr_code(totp_uri)
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        
        if not user:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "User not found"})
            }
        
        # Update user with 2FA secret
        update_query = """
            UPDATE users 
            SET mfa = %s 
            WHERE username = %s
            RETURNING id
        """
        cursor.execute(update_query, (encrypted_secret, username))
        conn.commit()
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "status": "success",
                "message": "2FA secret generated successfully",
                "secret": secret,  # Only included for demo purposes, remove in production
                "qr_code": qr_code_base64
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
