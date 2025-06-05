# --- Email imports ---
import psycopg2
import os
import bcrypt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import base64


# Helper to get a new DB connection each time
def get_db_conn():
    return psycopg2.connect(
        dbname=os.getenv("PGDATABASE", "thinkBot"),
        user=os.getenv("PGUSER", "avnadmin"),
        password=os.getenv("PGPASSWORD", "REMOVED"),
        host=os.getenv("PGHOST", "pg-rabbitanimated-postgres-animate28.i.aivencloud.com"),
        port=os.getenv("PGPORT", 13249)
    )


# Ensure users and conversation tables exist
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
# --- OTP generation helper ---
import random
def generate_otp():
    return str(random.randint(100000, 999999))


# --- Flask app and CORS setup (only once, at the top) ---
from flask import Flask, request, jsonify, g
from control.decision_engine import DecisionEngine
from flask_cors import CORS, cross_origin

app = Flask(__name__)
# Allow CORS for local frontend (adjust origins as needed)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
engine = DecisionEngine()

# --- Send OTP endpoint ---
@app.route("/send_otp", methods=["POST"])
def send_otp():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    otp = generate_otp()
    # Store OTP in DB
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM pending_verifications WHERE email=%s", (email,))
            cur.execute("INSERT INTO pending_verifications (email, otp, created_at) VALUES (%s, %s, %s)", (email, otp, datetime.utcnow()))
    # Send OTP email
    subject = "Your ThinkBot Registration OTP"
    body = f"<h2>Your OTP is: <b>{otp}</b></h2><p>Enter this code to verify your email address.</p>"
    email_sent = send_verification_email(email, subject, body)
    if not email_sent:
        return jsonify({"success": False, "message": "Could not send OTP email. Please contact support."}), 500
    return jsonify({"success": True, "message": "OTP sent to your email."})

# --- Verify OTP endpoint ---
@app.route("/verify_otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")
    if not email or not otp:
        return jsonify({"error": "Email and OTP required"}), 400
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT otp, created_at FROM pending_verifications WHERE email=%s", (email,))
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "No OTP found for this email."}), 400
            db_otp, created_at = row
            # Optionally check for OTP expiry (e.g. 10 min)
            if db_otp != otp:
                return jsonify({"error": "Invalid OTP."}), 400
            # OTP is valid, delete it
            cur.execute("DELETE FROM pending_verifications WHERE email=%s", (email,))
    return jsonify({"success": True, "message": "OTP verified. You can now set username and password."})
ensure_tables()


# (Removed duplicate Flask app/CORS setup here)


# --- Email sending function ---
def send_verification_email(email, subject, body):
    # These should be set as environment variables or securely in your config
    GMAIL_USER = os.getenv("EMAIL")
    CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN")

    if not all([GMAIL_USER, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN]):
        print("[ERROR] Gmail OAuth2 credentials not set in environment variables.")
        return False

    msg = MIMEMultipart()
    msg['From'] = GMAIL_USER
    msg['To'] = email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    # Set up OAuth2 credentials
    creds = Credentials(
        None,
        refresh_token=REFRESH_TOKEN,
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token"
    )
    creds.refresh(Request())
    access_token = creds.token

    auth_string = f"user={GMAIL_USER}\1auth=Bearer {access_token}\1\1"
    auth_string = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.docmd('AUTH', 'XOAUTH2 ' + auth_string)
            server.sendmail(GMAIL_USER, email, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False

# --- Register endpoint (after OTP verified) ---
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password required"}), 400
    # Check if OTP was verified
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pending_verifications WHERE email=%s", (email,))
            if cur.fetchone():
                return jsonify({"error": "OTP not verified for this email."}), 400
    try:
        # Hash the password
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO users (username, email, password, is_verified) VALUES (%s, %s, %s, %s) RETURNING id", (username, email, hashed.decode("utf-8"), True))
                user_id = cur.fetchone()[0]
        return jsonify({"success": True, "user_id": user_id, "message": "Registration complete. You can now log in."})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
# Add a verification endpoint for when the user clicks the link in their email
@app.route("/verify", methods=["POST"])
def verify_email():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email required"}), 400
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE users SET is_verified=TRUE WHERE email=%s", (email,))
            if cur.rowcount == 0:
                return jsonify({"error": "No such user/email"}), 404
    return jsonify({"success": True, "message": "Email verified. You can now log in."})

# Login endpoint (now checks PostgreSQL)
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT password, is_verified FROM users WHERE username=%s", (username,))
            row = cur.fetchone()
            if row:
                hashed, is_verified = row
                if not is_verified:
                    return make_response(jsonify({"error": "Email not verified. Please check your inbox."}), 401)
                if bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8")):
                    payload = {
                        "username": username,
                        "exp": dt.datetime.utcnow() + dt.timedelta(hours=12)
                    }
                    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
                    return jsonify({"token": token})
    return make_response(jsonify({"error": "Invalid credentials"}), 401)
import jwt
import datetime as dt
from flask import make_response

# Secret key for JWT (in production, use env var)
JWT_SECRET = "supersecretkey"
JWT_ALGO = "HS256"

# Dummy user for demo
USER = {"username": "admin", "password": "password"}

# @app.route("/login", methods=["POST"])
# def login():
#     data = request.get_json()
#     username = data.get("username")
#     password = data.get("password")
#     if username == USER["username"] and password == USER["password"]:
#         payload = {
#             "username": username,
#             "exp": dt.datetime.utcnow() + dt.timedelta(hours=12)
#         }
#         token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
#         return jsonify({"token": token})
#     return make_response(jsonify({"error": "Invalid credentials"}), 401)


# Helper: get user_id from JWT
import jwt
import datetime as dt
from flask import make_response
def get_user_id_from_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        username = payload["username"]
        print(f"[JWT DEBUG] Username from token: {username}")
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM users WHERE username=%s", (username,))
                row = cur.fetchone()
                print(f"[JWT DEBUG] DB row for username '{username}': {row}")
                if row:
                    return row[0]
    except Exception as e:
        print(f"[JWT DEBUG] Exception: {e}")
        return None
    return None

@app.route("/chat", methods=["POST", "OPTIONS"])
@cross_origin()
def chat():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    user_message = data.get("message", "")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
    # Save user message
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO conversation_history (user_id, timestamp, speaker, message) VALUES (%s, %s, %s, %s)",
                        (user_id, dt.datetime.utcnow(), "user", user_message))
    # Get bot reply
    bot_reply = engine.process_user_input(user_message)
    # Save bot reply
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO conversation_history (user_id, timestamp, speaker, message) VALUES (%s, %s, %s, %s)",
                        (user_id, dt.datetime.utcnow(), "bot", bot_reply))
    return jsonify({"reply": bot_reply})


# Get conversation for the logged-in user
@app.route("/memory", methods=["GET"])
def memory():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT timestamp, speaker, message FROM conversation_history WHERE user_id=%s ORDER BY timestamp ASC LIMIT 30", (user_id,))
            rows = cur.fetchall()
            conversation = [
                {"timestamp": r[0].isoformat(), "speaker": r[1], "message": r[2]} for r in rows
            ]
    # For now, summary and objects are not user-specific (could be extended)
    mem = engine.memory.memory
    return jsonify({
        "conversation": conversation,
        "summary": mem.get("summary", ""),
        "objects": mem.get("object_memory", {})
    })

from datetime import datetime, date
from textblob import TextBlob


# Get today's conversation and mood for a specific user from DB
def get_today_conversation_and_mood_db(user_id):
    today = date.today().isoformat()
    with get_db_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT timestamp, speaker, message FROM conversation_history
                WHERE user_id=%s AND to_char(timestamp, 'YYYY-MM-DD') = %s
                ORDER BY timestamp ASC
            """, (user_id, today))
            rows = cur.fetchall()
    today_msgs = [
        {"timestamp": r[0].isoformat(), "speaker": r[1], "message": r[2]} for r in rows
    ]
    # Daily summary (just join messages for now)
    summary = "\n".join(f"{m['speaker']}: {m['message']}" for m in today_msgs)
    # Mood analysis
    mood_timeline = []
    mood_score_total = 0
    mood_count = 0
    for m in today_msgs:
        text = m.get("message", "")
        if text:
            polarity = TextBlob(text).sentiment.polarity
            mood_timeline.append({
                "timestamp": m["timestamp"],
                "speaker": m["speaker"],
                "mood": polarity
            })
            mood_score_total += polarity
            mood_count += 1
    avg_mood = mood_score_total / mood_count if mood_count else 0
    return {
        "summary": summary,
        "mood_timeline": mood_timeline,
        "avg_mood": avg_mood,
        "count": mood_count
    }


@app.route("/stats", methods=["GET"])
def stats():
    user_id = get_user_id_from_token()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    stats = get_today_conversation_and_mood_db(user_id)
    return jsonify(stats)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)
from datetime import datetime, date
from textblob import TextBlob
def get_today_conversation_and_mood(mem):
    today = date.today().isoformat()
    convo = mem.get("conversation_history", [])
    today_msgs = [m for m in convo if m.get("timestamp", "").startswith(today)]
    # Daily summary (reuse summary if available, else join messages)
    summary = mem.get("summary", "")
    if not summary:
        summary = "\n".join(f"{m['speaker']}: {m['message']}" for m in today_msgs)
    # Mood analysis
    mood_timeline = []
    mood_score_total = 0
    mood_count = 0
    for m in today_msgs:
        text = m.get("message", "")
        if text:
            polarity = TextBlob(text).sentiment.polarity
            mood_timeline.append({
                "timestamp": m["timestamp"],
                "speaker": m["speaker"],
                "mood": polarity
            })
            mood_score_total += polarity
            mood_count += 1
    avg_mood = mood_score_total / mood_count if mood_count else 0
    return {
        "summary": summary,
        "mood_timeline": mood_timeline,
        "avg_mood": avg_mood,
        "count": mood_count
    }

## Duplicate /stats endpoint removed. Only the user-specific /stats endpoint remains.
