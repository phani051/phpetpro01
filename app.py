import os
import subprocess
import uuid
import json
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

SCRIPTS_DIR = "scripts"
UPLOAD_FOLDER = "uploads"
METADATA_FILE = "metadata.json"

# Ensure directories exist
os.makedirs(SCRIPTS_DIR, exist_ok=True)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ Route: Home Page
@app.route("/")
def index():
    return render_template("index.html")

# ✅ Route: List Available Scripts
@app.route("/list_scripts", methods=["GET"])
def list_scripts():
    try:
        scripts = [
            f for f in os.listdir(SCRIPTS_DIR) if f.endswith(".sh")
        ]
        print(f"DEBUG: Scripts found - {scripts}")  # Add debugging log
        return jsonify({"scripts": scripts})
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500

# ✅ Route: Get Script Descriptions
@app.route("/script_metadata", methods=["GET"])
def script_metadata():
    try:
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE, "r") as f:
                metadata = json.load(f)
        else:
            metadata = {}
        return jsonify(metadata)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Route: Execute Script with Argument & File Support
@app.route("/run_script", methods=["POST"])
def run_script():
    script_name = request.form.get("script_name")
    script_arg = request.form.get("script_arg", "").strip()
    uploaded_file = request.files.get("file")

    if not script_name:
        return jsonify({"error": "No script selected"}), 400

    script_path = os.path.join(SCRIPTS_DIR, script_name)
    if not os.path.exists(script_path):
        return jsonify({"error": f"Script {script_name} not found"}), 404

    file_path = None
    if uploaded_file:
        file_ext = os.path.splitext(uploaded_file.filename)[1]
        file_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}{file_ext}")
        uploaded_file.save(file_path)

    # Build command with argument and file
    command = ["bash", script_path]
    if script_arg:
        command.append(script_arg)
    if file_path:
        command.append(file_path)

    process = subprocess.Popen(
        command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    for line in process.stdout:
        socketio.emit("output", {"data": line.strip()})
    for line in process.stderr:
        socketio.emit("output", {"data": line.strip()})

    if file_path:
        os.remove(file_path)  # Cleanup uploaded file after execution

    return jsonify({"status": "running"})

# ✅ Run the Flask App
if __name__ == "__main__":
    socketio.run(app, port=5000, debug=True)
