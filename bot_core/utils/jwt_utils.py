import jwt
from flask import request
from .db import get_db_conn

JWT_SECRET = "supersecretkey"
JWT_ALGO = "HS256"

def get_user_id_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        username = payload["username"]
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM users WHERE username=%s", (username,))
                row = cur.fetchone()
                if row:
                    return row[0]
    except Exception as e:
        print(f"[JWT DEBUG] Exception: {e}")
        return None
    return None
