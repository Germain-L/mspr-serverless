import os
import string
import random
import hashlib
import base64
import json
import datetime
from cryptography.fernet import Fernet
import qrcode
import io

def generate_secure_password(length=24):
    """Generate a secure password with required complexity."""
    if length < 8:
        raise ValueError("Password length must be at least 8 characters")
    
    # Define character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    # Ensure at least one character from each set
    password = [
        random.choice(lowercase),
        random.choice(uppercase),
        random.choice(digits),
        random.choice(special)
    ]
    
    # Fill the rest of the password
    all_chars = lowercase + uppercase + digits + special
    password.extend(random.choices(all_chars, k=length - len(password)))
    
    # Shuffle to avoid predictable patterns
    random.shuffle(password)
    
    return ''.join(password)

def generate_qr_code(data):
    """Generate a base64 encoded QR code image."""
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

def get_db_connection():
    """Get database connection."""
    # This should be replaced with actual database connection logic
    # For now, we'll use a simple dictionary to simulate a database
    return {}

def encrypt_data(data, key):
    """Encrypt sensitive data."""
    f = Fernet(key)
    return f.encrypt(data.encode()).decode()

def handle(event, context):
    try:
        # Get request data
        body = json.loads(event.body) if event.body else {}
        username = body.get('username')
        
        if not username:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Username is required'})
            }
        
        # Generate secure password
        password = generate_secure_password()
        
        # Get current timestamp
        current_time = datetime.datetime.utcnow().isoformat()
        
        # In a real implementation, we would:
        # 1. Get encryption key from environment variable
        # 2. Encrypt the password
        # 3. Store in the database
        
        # For the PoC, we'll just return the password and QR code
        qr_data = f"Username: {username}\nPassword: {password}"
        qr_code = generate_qr_code(qr_data)
        
        # In a real implementation, we would return a success response with just a success message
        # But for the PoC, we'll return the password and QR code
        response = {
            'username': username,
            'password': password,  # In production, we wouldn't return the password
            'qr_code': qr_code,
            'generated_at': current_time,
            'expires_at': (datetime.datetime.utcnow() + datetime.timedelta(days=180)).isoformat()
        }
        
        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
