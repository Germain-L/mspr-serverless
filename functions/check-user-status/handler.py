"""
Ce module fournit une fonction OpenFaaS pour vérifier le statut d'un utilisateur.
Il interroge la base de données pour déterminer si un utilisateur existe,
si son compte a expiré et s'il a activé l'authentification à deux facteurs (2FA).
"""
import os
import json
import psycopg2
from psycopg2 import sql, OperationalError
from datetime import datetime, timezone
from dotenv import load_dotenv

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

def handle(event, context):
    """Point d'entrée principal pour la fonction de vérification du statut de l'utilisateur.

    Ce gestionnaire traite les requêtes pour vérifier le statut d'un utilisateur.
    Il attend un corps JSON contenant 'username'.

    Le processus comprend :
    1. Analyse de la requête entrante pour obtenir le nom d'utilisateur.
    2. Connexion à la base de données.
    3. Interrogation de la base de données pour obtenir les informations sur l'utilisateur :
        - Si l'authentification à deux facteurs (2FA) est activée.
        - Si le compte est marqué comme expiré.
        - Si le compte a expiré en fonction de sa date de création (plus de 6 mois).
    4. Si le compte a expiré en fonction du temps et n'est pas déjà marqué comme expiré,
       mise à jour de l'indicateur d'expiration dans la base de données.
    5. Renvoi d'une réponse HTTP avec le statut de l'utilisateur :
        - 'exists': booléen indiquant si l'utilisateur existe.
        - 'expired': booléen indiquant si le compte est expiré.
        - 'has_2fa': booléen indiquant si la 2FA est activée.

    Args:
        event: L'objet événement contenant les détails de la requête (par exemple, corps, en-têtes).
               Le corps de la requête doit être un JSON avec le champ 'username'.
        context: L'objet contexte d'exécution (non utilisé dans cette fonction).

    Returns:
        dict: Un dictionnaire représentant la réponse HTTP, contenant 'statusCode' et 'body'.
              Le corps est une chaîne JSON avec les informations sur le statut de l'utilisateur.
    """
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
        
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Query user status
        query = sql.SQL("""
            SELECT mfa IS NOT NULL, expired, 
                   EXTRACT(EPOCH FROM NOW() - to_timestamp(gendate/1000)) > (6 * 30 * 24 * 3600) as is_expired_by_time
            FROM users 
            WHERE username = %s
        """)
        
        cursor.execute(query, (username,))
        result = cursor.fetchone()
        
        if not result:
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "exists": False,
                    "expired": False,
                    "has_2fa": False
                })
            }
        
        has_2fa, is_expired, is_expired_by_time = result
        
        # If account is expired by time, update the expired flag
        if is_expired_by_time and not is_expired:
            update_query = "UPDATE users SET expired = TRUE WHERE username = %s"
            cursor.execute(update_query, (username,))
            conn.commit()
            is_expired = True
        
        cursor.close()
        conn.close()
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "exists": True,
                "expired": bool(is_expired or is_expired_by_time),
                "has_2fa": bool(has_2fa)
            })
        }
        
    except Exception as e:
        error_msg = str(e)
        if conn and 'cursor' in locals() and cursor:
            cursor.close()
        if conn and 'conn' in locals():
            conn.close()
        
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"An error occurred: {error_msg}"})
        }
