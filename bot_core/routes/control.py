from flask import request, jsonify
from bot_core.utils.jwt_utils import get_user_id_from_token

def register_routes(app, engine=None):
    @app.route("/control", methods=["POST"])
    def control_robot():
        user_id = get_user_id_from_token()
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        data = request.get_json()
        action = data.get("action")
        direction = data.get("direction")
        if action == "move" and direction in ["forward", "backward", "left", "right", "stop"]:
            try:
                result = None
                if engine and hasattr(engine, "move_robot"):
                    result = engine.move_robot(direction)
                else:
                    result = f"Simulated move: {direction}"
                return jsonify({"success": True, "result": result})
            except Exception as e:
                return jsonify({"success": False, "error": str(e)}), 500
        return jsonify({"error": "Invalid command"}), 400
