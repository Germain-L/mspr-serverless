"""
Ce module fournit une fonction OpenFaaS pour générer et configurer
l'authentification à deux facteurs (2FA) pour un utilisateur via TOTP (Time-based One-Time Password).

Il effectue les opérations suivantes :
- Génère un nouveau secret TOTP.
- Chiffre le secret avant de le stocker.
- Crée un URI de provisioning TOTP.
- Génère un QR code à partir de l'URI.
- Met à jour l'enregistrement de l'utilisateur dans la base de données avec le secret chiffré.
- Renvoie le secret (à des fins de démonstration, à supprimer en production) et le QR code en base64.
"""
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
    """Récupère la clé de chiffrement depuis les variables d'environnement."""
    key = os.getenv('ENCRYPTION_KEY')
    if not key:
        raise ValueError("ENCRYPTION_KEY environment variable not set")
    
    # Ensure the key is the correct length (32 bytes, base64-encoded)
    key = key.encode('utf-8')
    if len(key) != 44:  # 32 bytes = 44 base64 characters
        raise ValueError("ENCRYPTION_KEY must be 32 bytes, base64-encoded")
    
    return key

def encrypt_secret(secret):
    """Chiffre le secret TOTP avant de le stocker.

    Args:
        secret (str): Le secret TOTP à chiffrer.

    Returns:
        str: Le secret chiffré, encodé en base64.

    Raises:
        ValueError: Si la clé de chiffrement n'est pas définie.
    """
    key = get_encryption_key()
    f = Fernet(key)
    encrypted = f.encrypt(secret.encode('utf-8'))
    return encrypted.decode('utf-8')

def create_qr_code(data):
    """Crée un QR code et le retourne sous forme de chaîne encodée en base64."""
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
    """Point d'entrée principal pour la fonction de génération de 2FA.

    Ce gestionnaire traite les requêtes pour générer un secret 2FA (TOTP) pour un utilisateur.
    Il attend un corps JSON contenant 'username'.

    Le processus comprend :
    1. Analyse de la requête entrante pour obtenir le nom d'utilisateur.
    2. Génération d'un nouveau secret TOTP aléatoire.
    3. Chiffrement du secret.
    4. Création d'un URI de provisioning TOTP pour le QR code (incluant le nom d'utilisateur et l'émetteur).
    5. Génération d'une image QR code à partir de l'URI et encodage en base64.
    6. Connexion à la base de données.
    7. Vérification de l'existence de l'utilisateur.
    8. Mise à jour de l'enregistrement de l'utilisateur avec le nouveau secret MFA chiffré.
    9. Renvoi d'une réponse HTTP avec le statut, un message, le secret brut (pour démo)
       et le QR code encodé en base64.

    Args:
        event: L'objet événement contenant les détails de la requête (par exemple, corps, en-têtes).
               Le corps de la requête doit être un JSON avec le champ 'username'.
        context: L'objet contexte d'exécution (non utilisé dans cette fonction).

    Returns:
        dict: Un dictionnaire représentant la réponse HTTP, contenant 'statusCode' et 'body'.
              Le corps est une chaîne JSON avec les informations de configuration 2FA.
    """
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
