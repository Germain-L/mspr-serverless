import os
import json
import psycopg2
from psycopg2 import sql, OperationalError
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

def handle(event, context):
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
