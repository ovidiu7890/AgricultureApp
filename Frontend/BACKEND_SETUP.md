# Backend CORS Configuration

## IMPORTANT: Enable CORS in Flask Backend

To allow the frontend to communicate with the backend, you need to enable CORS (Cross-Origin Resource Sharing) in your Flask application.

### Installation

Run this command in the Backend directory:

```bash
pip install flask-cors
```

### Update app.py

Add CORS to your Flask app by modifying `Backend/app.py`:

```python
from flask import Flask
from flask_cors import CORS

from .forum_api import forum_bp
from .calendar_api import calendar_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(forum_bp)
app.register_blueprint(calendar_bp)


@app.route('/')
def hello_world():
    return 'Hello World!'


if __name__ == '__main__':
    app.run(debug=True)
```

### Running the Backend

Make sure your Flask backend is running on `http://localhost:5000`:

```bash
cd Backend
python app.py
```

### API Base URL

The frontend is configured to connect to `http://localhost:5000` by default. If your backend runs on a different port, update the `API_BASE_URL` in `src/services/apiConfig.js`.
