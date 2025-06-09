from datetime import date
from textblob import TextBlob
from .db import get_db_conn

def get_today_conversation_and_mood_db(user_id, engine=None):
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
    # Use LLM-generated summary if available
    summary = None
    if engine and hasattr(engine, "memory") and hasattr(engine.memory, "memory"):
        summary = engine.memory.memory.get("summary", None)
    if not summary:
        summary = "\n".join(f"{m['speaker']}: {m['message']}" for m in today_msgs)
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
