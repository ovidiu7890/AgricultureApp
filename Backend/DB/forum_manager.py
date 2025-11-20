import time

from google.cloud.firestore_v1 import transactional

from .firebase_config import db
from google.cloud import firestore
from google.cloud.firestore import Query


def get_all_posts_db():
    try:
        posts_ref = db.collection('posts')
        query = posts_ref.order_by('createdAt', direction=Query.DESCENDING).limit(50)

        posts_list = []
        for doc in query.stream():
            post_data = doc.to_dict()
            post_data['id'] = doc.id

            if 'createdAt' in post_data and post_data['createdAt'] is not None:
                post_data['createdAt'] = post_data['createdAt'].strftime('%Y-%m-%d %H:%M:%S')

            posts_list.append(post_data)

        return posts_list

    except Exception as e:
        print(f"Error fetching posts in DB layer: {e}")
        raise


def get_single_post_db(post_id):
    doc_ref = db.collection('posts').document(post_id)
    doc = doc_ref.get()

    if doc.exists:
        post_data = doc.to_dict()
        post_data['id'] = doc.id

        if 'createdAt' in post_data and post_data['createdAt'] is not None:
            post_data['createdAt'] = post_data['createdAt'].strftime('%Y-%m-%d %H:%M:%S')

        return post_data
    else:
        return None


def get_user_profile_db(user_uid):
    try:
        doc_ref = db.collection('users').document(user_uid)
        doc = doc_ref.get()

        if doc.exists:
            user_data = doc.to_dict()
            user_data['id'] = doc.id

            if 'createdAt' in user_data and user_data['createdAt'] is not None:
                user_data['createdAt'] = user_data['createdAt'].strftime('%Y-%m-%d')

            return user_data
        else:
            return None

    except Exception as e:
        print(f"Error fetching user profile in DB layer: {e}")
        raise


def get_comments_for_post_db(post_id):
    try:
        comments_ref = db.collection('posts').document(post_id).collection('comments')

        query = comments_ref.order_by('createdAt', direction=Query.ASCENDING)

        comments_list = []
        for doc in query.stream():
            comment_data = doc.to_dict()
            comment_data['id'] = doc.id

            if 'createdAt' in comment_data and comment_data['createdAt'] is not None:
                comment_data['createdAt'] = comment_data['createdAt'].strftime('%Y-%m-%d %H:%M:%S')

            comments_list.append(comment_data)

        return comments_list

    except Exception as e:
        print(f"Error fetching comments in DB layer: {e}")
        raise


def create_comment_db(post_id, author_id, content):

    try:
        comment_data = {
            'authorId': author_id,
            'content': content,
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        comments_ref = db.collection('posts').document(post_id).collection('comments')

        doc_ref_tuple = comments_ref.add(comment_data)
        new_comment_id = doc_ref_tuple[1].id

        increment_post_comment_count_db(post_id)

        return new_comment_id

    except Exception as e:
        print(f"Error creating comment in DB layer: {e}")
        raise


def create_user_profile_db(user_uid, username, email, bio=None):

    try:
        user_data = {
            'username': username,
            'email': email,
            'bio': bio if bio else "New user on the Agriculture Forum.",
            'postsCount': 0,
            'createdAt': firestore.SERVER_TIMESTAMP
        }

        users_ref = db.collection('users')
        users_ref.document(user_uid).set(user_data)

        print(f"User profile created for UID: {user_uid}")
        return user_uid

    except Exception as e:
        print(f"Error creating user profile in DB layer: {e}")
        raise


def create_post_db(author_id, title, content):
    try:
        post_data = {
            'authorId': author_id,
            'title': title,
            'content': content,
            'upvotes': 0,
            'downvotes': 0,
            'commentCount': 0,
            'createdAt': firestore.SERVER_TIMESTAMP
        }

        posts_ref = db.collection('posts')
        doc_ref_tuple = posts_ref.add(post_data)
        new_post_id = doc_ref_tuple[1].id

        increment_user_post_count_db(author_id)

        return new_post_id

    except Exception as e:
        print(f"Error creating post in DB layer: {e}")
        raise


@transactional
def update_vote_transaction(transaction, post_ref, user_uid, vote_type):
    vote_doc_ref = post_ref.collection('votes').document(user_uid)
    vote_doc = vote_doc_ref.get(transaction=transaction)

    if vote_doc.exists:
        raise ValueError("User has already voted on this post.")

    post_snapshot = post_ref.get(transaction=transaction)
    if not post_snapshot.exists:
        raise ValueError("Post does not exist.")

    update_data = {}
    if vote_type == 'up':
        update_data = {'upvotes': firestore.Increment(1)}
    elif vote_type == 'down':
        update_data = {'downvotes': firestore.Increment(1)}
    else:
        raise ValueError("Invalid vote type.")


    transaction.update(post_ref, update_data)
    transaction.set(vote_doc_ref, {'votedAt': firestore.SERVER_TIMESTAMP})

    return True


def handle_vote_db(post_id, user_uid, vote_type):
    try:
        post_ref = db.collection('posts').document(post_id)
        transaction = db.transaction()
        return update_vote_transaction(transaction, post_ref, user_uid, vote_type)

    except ValueError as ve:
        return False, str(ve)
    except Exception as e:
        print(f"Error handling vote in DB layer: {e}")
        raise


def increment_user_post_count_db(user_uid):
    try:
        user_ref = db.collection('users').document(user_uid)
        user_ref.update({
            'postsCount': firestore.Increment(1)
        })

        print(f"Post count incremented for user: {user_uid}")

    except Exception as e:
        print(f"Error incrementing post count for user {user_uid}: {e}")


def increment_post_comment_count_db(post_id):
    try:
        post_ref = db.collection('posts').document(post_id)
        post_ref.update({
            'commentCount': firestore.Increment(1)
        })

        print(f"Comment count incremented for post: {post_id}")

    except Exception as e:
        print(f"Error incrementing comment count for post {post_id}: {e}")


def decrement_post_comment_count_db(post_id):
    try:
        post_ref = db.collection('posts').document(post_id)

        post_ref.update({
            'commentCount': firestore.Increment(-1)
        })

        print(f"Comment count decremented for post: {post_id}")

    except Exception as e:
        print(f"Error decrementing comment count for post {post_id}: {e}")


def delete_comment_db(post_id, comment_id):
    try:
        comment_ref = db.collection('posts').document(post_id).collection('comments').document(comment_id)
        if not comment_ref.get().exists:
            return False

        comment_ref.delete()

        decrement_post_comment_count_db(post_id)

        return True

    except Exception as e:
        print(f"Error deleting comment {comment_id} from post {post_id} in DB layer: {e}")
        raise


def decrement_user_post_count_db(user_uid):
    try:
        user_ref = db.collection('users').document(user_uid)

        user_ref.update({
            'postsCount': firestore.Increment(-1)
        })

        print(f"Post count decremented for user: {user_uid}")

    except Exception as e:
        print(f"Error decrementing post count for user {user_uid}: {e}")


def delete_post_db(post_id):
    try:
        post_ref = db.collection('posts').document(post_id)
        post_doc = post_ref.get()

        if not post_doc.exists:
            return False, "Post not found."

        author_uid = post_doc.to_dict().get('authorId')


        comments_ref = post_ref.collection('comments')
        delete_collection_data(comments_ref)


        votes_ref = post_ref.collection('votes')
        deleted_votes = delete_collection_data(votes_ref)
        print(f"Total deleted votes: {deleted_votes}")

        if author_uid:
            decrement_user_post_count_db(author_uid)

        post_ref.delete()

        return True, "Post and all associated data deleted successfully."

    except Exception as e:
        print(f"Error deleting post {post_id} in DB layer: {e}")
        raise


def delete_collection_data(coll_ref, batch_size=50):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        print(f"Deleting document {doc.id} from collection {coll_ref.id}")
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        time.sleep(1)
        return deleted + delete_collection_data(coll_ref, batch_size)
    else:
        return deleted