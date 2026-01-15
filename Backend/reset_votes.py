import sys
import os
from google.cloud import firestore

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from DB.firebase_config import db

def delete_collection(coll_ref, batch_size=50):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        return deleted + delete_collection(coll_ref, batch_size)
    else:
        return deleted

def reset_all_votes():
    print("Starting vote reset...")
    
    posts_ref = db.collection('posts')
    posts = posts_ref.stream()
    
    count = 0
    for post in posts:
        post_id = post.id
        print(f"Resetting post: {post_id}")
        
        # 1. Reset counters
        posts_ref.document(post_id).update({
            'upvotes': 0,
            'downvotes': 0
        })
        
        # 2. Delete votes subcollection
        votes_ref = posts_ref.document(post_id).collection('votes')
        deleted_count = delete_collection(votes_ref)
        print(f"  - Cleared {deleted_count} vote records.")
        
        count += 1
        
    print(f"\nReset complete! Processed {count} posts.")

if __name__ == "__main__":
    reset_all_votes()
