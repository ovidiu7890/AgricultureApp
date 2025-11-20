from flask import Blueprint, jsonify, request

from DB.forum_manager import (
    get_all_posts_db,
    get_single_post_db,
    get_user_profile_db,
    get_comments_for_post_db,
    create_comment_db,
    create_user_profile_db,
    create_post_db,
    handle_vote_db,
    delete_comment_db, delete_post_db
)
forum_bp = Blueprint('forum', __name__, url_prefix='/api/forum')


@forum_bp.route('/posts', methods=['GET'])
def get_all_posts():
    try:
        posts = get_all_posts_db()
        return jsonify(posts), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve forum posts."}), 500


@forum_bp.route('/posts/<string:post_id>', methods=['GET'])
def get_post(post_id):
    post = get_single_post_db(post_id)
    if post:
        return jsonify(post), 200
    else:
        return jsonify({"error": "Post not found."}), 404


@forum_bp.route('/users/<string:user_uid>', methods=['GET'])
def get_user_profile(user_uid):
    try:
        profile = get_user_profile_db(user_uid)
        if profile:
            return jsonify(profile), 200
        else:
            return jsonify({"error": "User profile not found."}), 404
    except Exception as e:
        return jsonify({"error": "Failed to retrieve user profile."}), 500


@forum_bp.route('/posts/<string:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        comments = get_comments_for_post_db(post_id)
        return jsonify(comments), 200
    except Exception:
        return jsonify({"error": "Failed to retrieve comments."}), 500


@forum_bp.route('/posts/<string:post_id>/comments', methods=['POST'])
def add_comment(post_id):
    data = request.get_json()
    if not data or not all(k in data for k in ('authorId', 'content')):
        return jsonify({"error": "Missing required fields (authorId, content)."}), 400

    try:
        new_comment_id = create_comment_db(
            post_id=post_id,
            author_id=data['authorId'],
            content=data['content']
        )

        return jsonify({
            "message": "Comment created successfully.",
            "commentId": new_comment_id
        }), 201

    except Exception:
        return jsonify({"error": "Failed to create comment."}), 500


@forum_bp.route('/users', methods=['POST'])
def create_user_profile():
    data = request.get_json()

    required_fields = ['user_uid', 'username', 'email']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"error": "Missing required fields (user_uid, username, email)."}), 400

    try:
        new_uid = create_user_profile_db(
            user_uid=data['user_uid'],
            username=data['username'],
            email=data['email']
        )

        return jsonify({
            "message": "User profile created successfully.",
            "userId": new_uid
        }), 20

    except Exception:
        return jsonify({"error": "Failed to create user profile."}), 500


@forum_bp.route('/posts', methods=['POST'])
def add_post():
    data = request.get_json()

    required_fields = ['authorId', 'title', 'content']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"error": f"Missing required fields: {required_fields}"}), 400

    try:
        new_post_id = create_post_db(
            author_id=data['authorId'],
            title=data['title'],
            content=data['content']
        )

        return jsonify({
            "message": "Post created successfully.",
            "postId": new_post_id
        }), 201

    except Exception:
        return jsonify({"error": "Failed to create post."}), 500


@forum_bp.route('/posts/<string:post_id>/vote', methods=['POST'])
def vote_post(post_id):
    data = request.get_json()

    if not data or not all(k in data for k in ('user_uid', 'vote_type')):
        return jsonify({"error": "Missing required fields (user_uid, vote_type)."}), 400

    vote_type = data['vote_type'].lower()
    if vote_type not in ('up', 'down'):
        return jsonify({"error": "vote_type must be 'up' or 'down'."}), 400

    try:
        result, message = handle_vote_db(post_id, data['user_uid'], vote_type)

        if result is True:
            return jsonify({"message": f"Vote '{vote_type}' recorded successfully."}), 200
        else:
            return jsonify({"error": message}), 400

    except Exception:
        return jsonify({"error": "Failed to process vote due to a server error."}), 500


@forum_bp.route('/posts/<string:post_id>/comments/<string:comment_id>', methods=['DELETE'])
def delete_comment(post_id, comment_id):
    try:
        success = delete_comment_db(post_id, comment_id)

        if success:
            return jsonify({"message": "Comment deleted successfully."}), 200
        else:
            return jsonify({"error": "Comment not found."}), 404

    except Exception:
        return jsonify({"error": "Failed to delete comment due to a server error."}), 500


@forum_bp.route('/posts/<string:post_id>', methods=['DELETE'])
def delete_post(post_id):
    try:
        success, message = delete_post_db(post_id)

        if success:
            return jsonify({"message": message}), 200
        else:
            return jsonify({"error": message}), 404

    except Exception:
        return jsonify({"error": "Failed to delete post due to a server error."}), 500