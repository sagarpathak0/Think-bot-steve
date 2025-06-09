from flask import request, jsonify
from bot_core.utils.jwt_utils import get_user_id_from_token
from bot_core.utils.db import get_db_conn
from bot_core.utils.mood_utils import get_today_conversation_and_mood_db
import datetime as dt
from flask_cors import cross_origin

def register_routes(app, engine=None):
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
        bot_reply = engine.process_user_input(user_message) if engine else "Bot reply not available."
        # Save bot reply
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO conversation_history (user_id, timestamp, speaker, message) VALUES (%s, %s, %s, %s)",
                            (user_id, dt.datetime.utcnow(), "bot", bot_reply))
        return jsonify({"reply": bot_reply})

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
        mem = engine.memory.memory if engine else {"summary": "", "object_memory": {}}
        return jsonify({
            "conversation": conversation,
            "summary": mem.get("summary", ""),
            "objects": mem.get("object_memory", {})
        })

    @app.route("/stats", methods=["GET"])
    def stats():
        user_id = get_user_id_from_token()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        stats = get_today_conversation_and_mood_db(user_id, engine=engine)
        return jsonify(stats)
