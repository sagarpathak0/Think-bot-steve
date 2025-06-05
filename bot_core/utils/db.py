import psycopg2
import os

def get_db_conn():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("PGDATABASE"),
            user=os.getenv("PGUSER"),
            password=os.getenv("PGPASSWORD"),
            host=os.getenv("PGHOST"),
            port=os.getenv("PGPORT")
        )
        print("[DB] Connection successful.")
        return conn
    except Exception as e:
        print(f"[DB] Connection failed: {e}")
        raise

def ensure_tables():
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT,
                    is_verified BOOLEAN DEFAULT FALSE
                )
            ''')
            cur.execute('''
                CREATE TABLE IF NOT EXISTS conversation_history (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    timestamp TIMESTAMP NOT NULL,
                    speaker TEXT NOT NULL,
                    message TEXT NOT NULL
                )
            ''')
            cur.execute('''
                CREATE TABLE IF NOT EXISTS pending_verifications (
                    email TEXT PRIMARY KEY,
                    otp TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL
                )
            ''')
