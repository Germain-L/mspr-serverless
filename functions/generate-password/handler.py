"""
Ce module fournit une fonction OpenFaaS pour générer un mot de passe sécurisé
et créer un nouvel utilisateur dans la base de données.

Il effectue les opérations suivantes :
- Génère un mot de passe aléatoire sécurisé.
- Hache le mot de passe en utilisant bcrypt.
- Insère un nouvel utilisateur dans la base de données avec le nom d'utilisateur fourni,
  le mot de passe haché et la date de création.
- Crée un QR code contenant le nom d'utilisateur et le mot de passe en clair (à des fins de démonstration).
- Renvoie l'ID de l'utilisateur, le mot de passe en clair et le QR code en base64.
"""
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
from .shared_metrics import (
    track_request_metrics, track_db_operation, get_metrics, get_metrics_content_type
)

def get_db_connection():
    """Crée et retourne une connexion à la base de données."""
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
    """Génère un mot de passe aléatoire sécurisé avec des lettres minuscules et majuscules, des chiffres et des caractères spéciaux."""
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

@track_request_metrics('generate-password')
def handle(event, context):
    """Point d'entrée principal pour la fonction de génération de mot de passe et de création d'utilisateur.

    Ce gestionnaire traite les requêtes pour créer un nouvel utilisateur avec un mot de passe généré.
    Il attend un corps JSON contenant 'username'.

    Le processus comprend :
    1. Analyse de la requête entrante pour obtenir le nom d'utilisateur.
    2. Génération d'un mot de passe sécurisé aléatoire.
    3. Hachage du mot de passe généré.
    4. Enregistrement de la date de création actuelle.
    5. Connexion à la base de données.
    6. Vérification si le nom d'utilisateur existe déjà.
    7. Insertion du nouvel utilisateur dans la base de données avec le nom d'utilisateur,
       le mot de passe haché et la date de création.
    8. Création d'un QR code contenant le nom d'utilisateur et le mot de passe en clair.
    9. Renvoi d'une réponse HTTP avec le statut, un message, l'ID de l'utilisateur,
       le mot de passe en clair (pour démo) et le QR code encodé en base64.

    Args:
        event: L'objet événement contenant les détails de la requête (par exemple, corps, en-têtes).
               Le corps de la requête doit être un JSON avec le champ 'username'.
        context: L'objet contexte d'exécution (non utilisé dans cette fonction).

    Returns:
        dict: Un dictionnaire représentant la réponse HTTP, contenant 'statusCode' et 'body'.
              Le corps est une chaîne JSON avec les informations de l'utilisateur créé et son mot de passe.
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
        with track_db_operation('generate-password', 'connect'):
            conn = get_db_connection()
            cursor = conn.cursor()
        
        # Check if user already exists
        with track_db_operation('generate-password', 'check_user_exists'):
            cursor.execute("SELECT 1 FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "Username already exists"})
                }
        
        # Insert new user
        with track_db_operation('generate-password', 'insert_user'):
            insert_query = """
                INSERT INTO users (username, password, gendate, expired)
                VALUES (%s, %s, %s, FALSE)
                RETURNING id
            """
            cursor.execute(insert_query, (username, hashed_password.decode('utf-8'), gendate))
            user_id = cursor.fetchone()[0]
            conn.commit()
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
