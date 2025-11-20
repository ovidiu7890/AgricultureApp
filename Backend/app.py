from flask import Flask

from .forum_api import forum_bp
from .calendar_api import calendar_bp

app = Flask(__name__)

app.register_blueprint(forum_bp)
app.register_blueprint(calendar_bp)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


if __name__ == '__main__':
    app.run(debug=True)
