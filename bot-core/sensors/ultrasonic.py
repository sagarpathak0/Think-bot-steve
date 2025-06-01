# Ultrasonic sensor server (Flask)
from flask import Flask, request, jsonify
import threading
import logging

# Configure Flask to be silent
app = Flask(__name__)
app.logger.setLevel(logging.ERROR)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# Store the latest distance value
distance_data = {"distance": None}

@app.route('/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    if data and "distance" in data:
        distance_data["distance"] = data["distance"]
        # Comment out to stop printing each reading
        # print(f"Received distance: {data['distance']} cm")
        return jsonify({"status": "success"}), 200
    return jsonify({"status": "error", "message": "Invalid data"}), 400

@app.route('/distance', methods=['GET'])
def get_distance():
    # Returns the latest distance value
    return jsonify(distance_data)

def start_server():
    """Start the Flask server"""
    # Remove the problem-causing environment variable
    import os
    if 'WERKZEUG_RUN_MAIN' in os.environ:
        del os.environ['WERKZEUG_RUN_MAIN']
        
    app.run(host='0.0.0.0', port=5000, debug=False)

def start_ultrasonic_server():
    """Start the Flask server in a background thread"""
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    print("Ultrasonic sensor server started on port 5000")
    return server_thread
