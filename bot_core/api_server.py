
# --- Email imports ---

print("=== App starting ===")
from flask import Flask, jsonify
import psutil
from flask_cors import CORS
print("=== Flask, psutil, and CORS imported ===")

print("=== Importing internal modules ===")
from control.decision_engine import DecisionEngine
from bot_core.utils.db import ensure_tables
from bot_core.routes import auth, chat, control
print("=== Internal modules imported ===")

app = Flask(__name__)
print("=== Flask app created ===")


app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:3000",
        "https://think-bot-steve.vercel.app",
        "https://think-bot-steve.me",
        "https://www.think-bot-steve.me"
    ]
)
engine = DecisionEngine()

ensure_tables()
auth.register_routes(app)
chat.register_routes(app, engine=engine)
control.register_routes(app, engine=engine)


# --- System resource stats endpoint with network speed ---
import time

# Global variable to store previous network stats
_last_net = {"bytes_sent": 0, "bytes_recv": 0, "timestamp": time.time()}

@app.route("/system_stats", methods=["GET"])
def system_stats():
    try:
        cpu = psutil.cpu_percent(interval=0.5)
        mem = psutil.virtual_memory()
        ram = mem.percent

        # Network speed calculation
        net = psutil.net_io_counters()
        now = time.time()
        global _last_net
        elapsed = now - _last_net["timestamp"]
        if elapsed > 0:
            sent_speed = (net.bytes_sent - _last_net["bytes_sent"]) / elapsed
            recv_speed = (net.bytes_recv - _last_net["bytes_recv"]) / elapsed
        else:
            sent_speed = recv_speed = 0.0
        _last_net = {
            "bytes_sent": net.bytes_sent,
            "bytes_recv": net.bytes_recv,
            "timestamp": now,
        }

        return jsonify({
            "cpu": cpu,
            "ram": ram,
            "net": {
                "sent": sent_speed,   # bytes/sec
                "recv": recv_speed    # bytes/sec
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"=== Starting Flask server on port {port} ===")
    app.run(host="0.0.0.0", port=port, debug=True)

