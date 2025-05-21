import os
import base64
import json
import datetime
import pyotp
import qrcode
import io

def generate_2fa_secret(username):
    """Generate a new 2FA secret for the user."""
    # Generate a random secret
    secret = pyotp.random_base32()
    
    # Create a TOTP object
    totp = pyotp.TOTP(secret)
    
    # Generate provisioning URI for QR code
    provisioning_uri = totp.provisioning_uri(
        name=username,
        issuer_name="COFRAP"
    )
    
    return {
        'secret': secret,
        'provisioning_uri': provisioning_uri
    }

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
        
        # Generate 2FA secret and provisioning URI
        two_fa_data = generate_2fa_secret(username)
        
        # Generate QR code for the provisioning URI
        qr_code = generate_qr_code(two_fa_data['provisioning_uri'])
        
        # In a real implementation, we would:
        # 1. Encrypt the secret
        # 2. Store it in the database
        # 3. Associate it with the user
        
        # For the PoC, we'll return the secret and QR code
        response = {
            'username': username,
            'secret': two_fa_data['secret'],  # In production, we wouldn't return the secret
            'qr_code': qr_code,
            'generated_at': datetime.datetime.utcnow().isoformat(),
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
