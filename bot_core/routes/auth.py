from flask import request, jsonify, make_response
from bot_core.utils.db import get_db_conn
from bot_core.utils.email_utils import send_verification_email
from bot_core.utils.jwt_utils import JWT_SECRET, JWT_ALGO
import bcrypt, jwt, datetime as dt
import random

def register_routes(app):
    @app.route("/me", methods=["GET"])
    def get_me():
        from bot_core.utils.jwt_utils import get_user_id_from_token
        user_id = get_user_id_from_token()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT username, email FROM users WHERE id=%s", (user_id,))
                row = cur.fetchone()
                if not row:
                    return jsonify({"error": "User not found"}), 404
                username, email = row
        return jsonify({"username": username, "email": email})
    @app.route("/send_otp", methods=["POST"])
    def send_otp():
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email required"}), 400
        otp = str(random.randint(100000, 999999))
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM pending_verifications WHERE email=%s", (email,))
                cur.execute("INSERT INTO pending_verifications (email, otp, created_at) VALUES (%s, %s, %s)", (email, otp, dt.datetime.utcnow()))
        subject = "Your ThinkBot Registration OTP"
        body = f"<h2>Your OTP is: <b>{otp}</b></h2><p>Enter this code to verify your email address.</p>"
        email_sent = send_verification_email(email, subject, body)
        if not email_sent:
            return jsonify({"success": False, "message": "Could not send OTP email. Please contact support."}), 500
        return jsonify({"success": True, "message": "OTP sent to your email."})

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
                if db_otp != otp:
                    return jsonify({"error": "Invalid OTP."}), 400
                cur.execute("DELETE FROM pending_verifications WHERE email=%s", (email,))
        return jsonify({"success": True, "message": "OTP verified. You can now set username and password."})

    @app.route("/register", methods=["POST"])
    def register():
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        if not username or not email or not password:
            return jsonify({"error": "Username, email, and password required"}), 400
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM pending_verifications WHERE email=%s", (email,))
                if cur.fetchone():
                    return jsonify({"error": "OTP not verified for this email."}), 400
        try:
            hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
            with get_db_conn() as conn:
                with conn.cursor() as cur:
                    cur.execute("INSERT INTO users (username, email, password, is_verified) VALUES (%s, %s, %s, %s) RETURNING id", (username, email, hashed.decode("utf-8"), True))
                    user_id = cur.fetchone()[0]
            return jsonify({"success": True, "user_id": user_id, "message": "Registration complete. You can now log in."})
        except Exception as e:
            return jsonify({"error": str(e)}), 400

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
