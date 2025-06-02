"""
Ce module gère l'authentification des utilisateurs pour une fonction OpenFaaS.
Il comprend la vérification du mot de passe, l'authentification à deux facteurs (2FA) via TOTP,
la gestion de l'expiration des comptes et l'interaction avec une base de données PostgreSQL.
"""
import os
import json
import bcrypt
import pyotp
import psycopg2
from psycopg2 import sql
from cryptography.fernet import Fernet, InvalidToken
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from shared_metrics import (
    track_request_metrics, track_db_operation, track_authentication, 
    track_2fa_operation, get_metrics, get_metrics_content_type
)


# Load environment variables at module level
load_dotenv()

# Constants
ACCOUNT_EXPIRY_DAYS = 180  # 6 mois

def get_db_connection():
    """Crée et retourne une connexion à la base de données."""
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
    """Récupère la clé de chiffrement à partir des variables d'environnement."""
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        raise ValueError("ENCRYPTION_KEY environment variable not set")
    
    # Ensure the key is the correct length (32 bytes, base64-encoded)
    key = key.encode('utf-8')
    if len(key) != 44:  # 32 bytes = 44 base64 characters
        raise ValueError("ENCRYPTION_KEY must be 32 bytes, base64-encoded")
    
    return key

def decrypt_secret(encrypted_secret):
    """Déchiffre le secret TOTP.

    Args:
        encrypted_secret (str): Le secret chiffré encodé en base64.

    Returns:
        str or None: Le secret déchiffré, ou None si aucun secret chiffré n'est fourni.

    Raises:
        ValueError: Si la clé de chiffrement n'est pas définie ou si le jeton est invalide.
    """
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
    """Vérifie le mot de passe fourni par rapport au mot de passe stocké.

    Args:
        stored_password (str): Le mot de passe stocké.
        provided_password (str): Le mot de passe fourni.

    Returns:
        bool: True si les mots de passe correspondent, False sinon.

    Raises:
        ValueError: Si la vérification du mot de passe échoue pour une raison inattendue.
    """
    try:
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))
    except Exception as e:
        raise ValueError(f"Password verification failed: {str(e)}")

def verify_totp(secret, totp_code):
    """Vérifie le code TOTP par rapport au secret.

    Args:
        secret (str): Le secret TOTP de l'utilisateur.
        totp_code (str): Le code TOTP fourni par l'utilisateur.

    Returns:
        bool: True si le code TOTP est valide, False sinon.

    Raises:
        ValueError: Si la vérification TOTP échoue pour une raison inattendue.
    """
    if not secret or not totp_code:
        return False
    
    try:
        totp = pyotp.TOTP(secret)
        return totp.verify(totp_code, valid_window=1)  # Allow 1 step (30s) before/after
    except Exception as e:
        raise ValueError(f"TOTP verification failed: {str(e)}")

def is_account_expired(gendate_timestamp):
    """Vérifie si le compte a expiré en fonction de la date de création.

    Args:
        gendate_timestamp (int): La date de création du compte en timestamp.

    Returns:
        bool: True si le compte a expiré, False sinon.
    """
    if not gendate_timestamp:
        return True
        
    creation_date = datetime.fromtimestamp(gendate_timestamp / 1000, timezone.utc)
    expiry_date = creation_date + timedelta(days=ACCOUNT_EXPIRY_DAYS)
    return datetime.now(timezone.utc) > expiry_date


@track_request_metrics('authenticate-user')
def handle(event, context):
    """Point d'entrée principal pour la fonction d'authentification OpenFaaS.

    Ce gestionnaire traite les requêtes d'authentification des utilisateurs. Il attend un corps JSON
    contenant 'username', 'password', et optionnellement 'totp_code'.

    Le processus comprend :
    1. Analyse de la requête entrante.
    2. Validation des entrées (nom d'utilisateur et mot de passe).
    3. Connexion à la base de données.
    4. Récupération des informations de l'utilisateur.
    5. Vérification du mot de passe.
    6. Si l'authentification à deux facteurs (2FA) est activée :
        a. Vérification de la présence du code TOTP.
        b. Déchiffrement du secret MFA stocké.
        c. Vérification du code TOTP.
    7. Vérification de l'expiration du compte (basée sur la date de création et un indicateur 'expired').
    8. Mise à jour de l'état d'expiration dans la base de données si nécessaire.
    9. Renvoi d'une réponse HTTP appropriée (succès, échec, compte expiré, etc.).

    Args:
        event: L'objet événement contenant les détails de la requête (par exemple, corps, en-têtes).
               Le corps de la requête doit être un JSON avec les champs 'username', 'password',
               et optionnellement 'totp_code'.
        context: L'objet contexte d'exécution (non utilisé dans cette fonction).

    Returns:
        dict: Un dictionnaire représentant la réponse HTTP, contenant 'statusCode' et 'body'.
              Le corps est une chaîne JSON avec des détails sur le résultat de l'authentification.
    """
    # Handle metrics endpoint
    if hasattr(event, 'path') and event.path == '/metrics':
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": get_metrics_content_type()
            },
            "body": get_metrics().decode('utf-8')
        }
    
    conn = None
    cursor = None
    try:
        # Parse incoming request
        try:
            body = json.loads(event.body) if hasattr(event, 'body') and event.body else {}
            username = body.get('username')
            password = body.get('password')
            totp_code = body.get('totp_code')
            context_param = body.get('context')  # Get the context
        except json.JSONDecodeError:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Invalid JSON in request body"})
            }
        
        # Validate input based on context
        if context_param == '2fa_setup_verification':
            if not username or not totp_code:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "Username and TOTP code are required for 2FA setup verification"})
                }
            # Password is not required for 2FA setup verification
        else:  # Normal login
            if not username or not password:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "Username and password are required"})
                }
        
        # Connect to database
        with track_db_operation('authenticate-user', 'connect'):
            conn = get_db_connection()
            cursor = conn.cursor()
        
        # Get user data
        with track_db_operation('authenticate-user', 'select_user'):
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
            track_authentication('authenticate-user', False)
            return {
                "statusCode": 401,
                "body": json.dumps({"error": "Invalid username or password"})
            }
        
        user_id, stored_password, encrypted_mfa, gendate, is_expired = user
        
        # --- 2FA Setup Verification Logic ---
        if context_param == '2fa_setup_verification':
            if not encrypted_mfa:
                return {
                    "statusCode": 400, # Or 404 if user setup was incomplete
                    "body": json.dumps({"error": "2FA is not pending setup for this user or secret not found"})
                }
            try:
                mfa_secret = decrypt_secret(encrypted_mfa)
                totp_valid = verify_totp(mfa_secret, totp_code)
                track_2fa_operation('authenticate-user', 'setup_verification', totp_valid)
                
                if not totp_valid:
                    return {
                        "statusCode": 401,
                        "body": json.dumps({"error": "Invalid TOTP code for 2FA setup"})
                    }
                # TOTP is valid for setup
                # Check account expiration before confirming setup
                is_expired_by_time_setup = is_account_expired(gendate)
                if is_expired_by_time_setup and not is_expired:
                    with track_db_operation('authenticate-user', 'update_expired'):
                        cursor.execute("UPDATE users SET expired = TRUE WHERE id = %s", (user_id,))
                        conn.commit()
                    is_expired = True
                
                if is_expired or is_expired_by_time_setup:
                    track_authentication('authenticate-user', False)
                    return {
                        "statusCode": 403,
                        "body": json.dumps({"status": "expired", "message": "Account has expired. Cannot complete 2FA setup."})
                    }

                track_authentication('authenticate-user', True)
                return {
                    "statusCode": 200,
                    "body": json.dumps({
                        "status": "success", 
                        "message": "2FA setup verified and active",
                        "user_id": user_id,
                        "has_2fa": True
                    })
                }
            except Exception as e:
                track_2fa_operation('authenticate-user', 'setup_verification', False)
                return {
                    "statusCode": 500,
                    "body": json.dumps({"error": f"2FA setup verification failed: {str(e)}"})
                }
        # --- End of 2FA Setup Verification Logic ---

        # --- Normal Login Logic (if not 2fa_setup_verification context) ---
        # Check password
        password_valid = check_password(stored_password, password)
        if not password_valid:
            track_authentication('authenticate-user', False)
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
                totp_valid = verify_totp(mfa_secret, totp_code)
                track_2fa_operation('authenticate-user', 'login_verification', totp_valid)
                
                if not totp_valid:
                    track_authentication('authenticate-user', False)
                    return {
                        "statusCode": 401,
                        "body": json.dumps({"error": "Invalid TOTP code"})
                    }
            except Exception as e:
                track_2fa_operation('authenticate-user', 'login_verification', False)
                return {
                    "statusCode": 500,
                    "body": json.dumps({"error": f"TOTP verification failed: {str(e)}"})
                }
        
        # Check account expiration
        is_expired_by_time = is_account_expired(gendate)
        
        # Update expired status if needed
        if is_expired_by_time and not is_expired:
            with track_db_operation('authenticate-user', 'update_expired'):
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
            track_authentication('authenticate-user', False)
            return {
                "statusCode": 403,
                "body": json.dumps({
                    "status": "expired",
                    "message": "Account has expired. Please contact support."
                })
            }
        
        # Authentication successful
        track_authentication('authenticate-user', True)
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
