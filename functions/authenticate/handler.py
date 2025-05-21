import os
import json
import datetime
import pyotp

def get_user_credentials(username):
    """
    Retrieve user credentials from the database.
    In a real implementation, this would query the database.
    """
    # Mock database
    users = {
        "testuser": {
            "password": "hashed_password_here",
            "2fa_secret": "JBSWY3DPEHPK3PXP",
            "last_password_change": "2025-01-01T00:00:00",
            "is_locked": False,
            "failed_attempts": 0
        }
    }
    return users.get(username)

def verify_2fa(secret, token):
    """Verify the 2FA token."""
    totp = pyotp.TOTP(secret)
    return totp.verify(token)

def is_password_expired(last_change_date_str, expiry_days=180):
    """Check if the password has expired."""
    try:
        last_change = datetime.datetime.fromisoformat(last_change_date_str)
        expiry_date = last_change + datetime.timedelta(days=expiry_days)
        return datetime.datetime.utcnow() > expiry_date
    except (ValueError, TypeError):
        return True  # If we can't parse the date, consider it expired

def handle(event, context):
    try:
        # Parse request body
        body = json.loads(event.body) if event.body else {}
        username = body.get('username')
        password = body.get('password')
        two_fa_token = body.get('two_fa_token')
        
        # Input validation
        if not all([username, password, two_fa_token]):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Username, password, and 2FA token are required'})
            }
        
        # Get user from database
        user = get_user_credentials(username)
        
        # Check if user exists
        if not user:
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Invalid credentials'})
            }
        
        # Check if account is locked
        if user.get('is_locked', False):
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Account is locked'})
            }
        
        # Check if password is expired
        if is_password_expired(user.get('last_password_change')):
            return {
                'statusCode': 401,
                'body': json.dumps({
                    'error': 'Password expired',
                    'requires_password_reset': True
                })
            }
        
        # In a real implementation, verify the password hash
        # For this PoC, we'll skip password verification
        
        # Verify 2FA token
        if not verify_2fa(user['2fa_secret'], two_fa_token):
            # Increment failed attempts
            user['failed_attempts'] = user.get('failed_attempts', 0) + 1
            
            # Lock account after 3 failed attempts
            if user['failed_attempts'] >= 3:
                user['is_locked'] = True
                return {
                    'statusCode': 403,
                    'body': json.dumps({
                        'error': 'Too many failed attempts. Account locked.',
                        'account_locked': True
                    })
                }
            
            return {
                'statusCode': 401,
                'body': json.dumps({
                    'error': 'Invalid 2FA token',
                    'attempts_remaining': 3 - user['failed_attempts']
                })
            }
        
        # Reset failed attempts on successful login
        user['failed_attempts'] = 0
        
        # Generate session token (in a real implementation)
        session_token = "dummy_session_token"
        
        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Authentication successful',
                'username': username,
                'session_token': session_token,
                'expires_in': 3600  # 1 hour in seconds
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }
