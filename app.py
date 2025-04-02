import os
import subprocess
from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

SCRIPTS_DIR = "scripts"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_scripts')
def get_scripts():
    """Fetch the list of available scripts from the scripts directory."""
    scripts = [f for f in os.listdir(SCRIPTS_DIR) if os.path.isfile(os.path.join(SCRIPTS_DIR, f))]
    return jsonify(scripts)

@socketio.on('run_script')
def handle_script_execution(data):
    """Execute the selected script with optional arguments and stream output."""
    script_name = data.get('script_name')
    script_args = data.get('args', '').split()
    script_path = os.path.join(SCRIPTS_DIR, script_name)

    if os.path.exists(script_path):
        process = subprocess.Popen(
            ['bash', script_path] + script_args,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )

        for line in process.stdout:
            emit('output', {'data': line}, broadcast=True)
        for line in process.stderr:
            emit('output', {'data': line}, broadcast=True)
    else:
        emit('output', {'data': f"Script {script_name} not found."}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, port=5000, debug=True)
