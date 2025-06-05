
# --- Email imports ---

from flask import Flask
from flask_cors import CORS
from control.decision_engine import DecisionEngine
from bot_core.utils.db import ensure_tables
from bot_core.routes import auth, chat, control

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
engine = DecisionEngine()

ensure_tables()
auth.register_routes(app)
chat.register_routes(app, engine=engine)
control.register_routes(app, engine=engine)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)
