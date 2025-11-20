from flask import Flask, jsonify
from Backend.DB.forum_manager import get_all_posts_db, get_single_post_db, get_user_profile_db

app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'





if __name__ == '__main__':
    app.run(debug=True)
