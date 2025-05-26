import os
import json
import secrets
import string
import bcrypt
import qrcode
import io
import base64
import psycopg2
from psycopg2 import sql
from datetime import datetime, timezone
from dotenv import load_dotenv

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

def generate_secure_password(length=24):
    """Generate a secure random password with mixed case, numbers and special chars."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        # Ensure password contains at least one of each required character type
        if (any(c.islower() for c in password)
                and any(c.isupper() for c in password)
                and any(c.isdigit() for c in password)
                and any(c in "!@#$%^&*" for c in password)):
            return password

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
        
        # Generate secure password
        password = generate_secure_password()
        
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Current timestamp in milliseconds
        gendate = int(datetime.now(timezone.utc).timestamp() * 1000)
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT 1 FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Username already exists"})
            }
        
        # Insert new user
        insert_query = """
            INSERT INTO users (username, password, gendate, expired)
            VALUES (%s, %s, %s, FALSE)
            RETURNING id
        """
        cursor.execute(insert_query, (username, hashed_password.decode('utf-8'), gendate))
        user_id = cursor.fetchone()[0]
        conn.commit()
        
        # Create QR code with the password
        qr_data = f"Username: {username}\nPassword: {password}"
        qr_code_base64 = create_qr_code(qr_data)
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "status": "success",
                "message": "Password generated and user created successfully",
                "user_id": user_id,
                "password": password,  # Only included for demo purposes, remove in production
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
