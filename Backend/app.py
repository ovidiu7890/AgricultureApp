from flask import Flask
from flask_cors import CORS

from .forum_api import forum_bp
from .calendar_api import calendar_bp
from .DB.firebase_config import db  # Import to initialize Firebase

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(forum_bp)
app.register_blueprint(calendar_bp)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


if __name__ == '__main__':
    app.run(debug=True)
