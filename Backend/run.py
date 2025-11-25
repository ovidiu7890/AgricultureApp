"""
Flask application runner for AgriConnect Backend
Run this file to start the Flask development server with Firebase integration
"""
import sys
import os

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS

# Initialize Firebase FIRST before importing blueprints
from DB.firebase_config import db

# Now import blueprints (they will use the already-initialized Firebase)
from forum_api import forum_bp
from calendar_api import calendar_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register blueprints
app.register_blueprint(forum_bp)
app.register_blueprint(calendar_bp)


@app.route('/')
def hello_world():
    return 'AgriConnect Backend is running! Firebase is connected.'


@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'firebase': 'connected' if db is not None else 'disconnected',
        'message': 'Backend is running'
    }


if __name__ == '__main__':
    print("=" * 60)
    print("Starting AgriConnect Backend Server")
    print("=" * 60)
    print(f"Firebase DB initialized: {db is not None}")
    print("Server will run on: http://localhost:5000")
    print("API Endpoints:")
    print("  - Forum: http://localhost:5000/api/forum/posts")
    print("  - Calendar: http://localhost:5000/api/calendar/")
    print("  - Health: http://localhost:5000/health")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
