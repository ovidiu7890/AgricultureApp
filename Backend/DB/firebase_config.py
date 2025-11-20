import firebase_admin
from firebase_admin import credentials, firestore
#import os  # We'll use this later for better path handling

SERVICE_ACCOUNT_KEY_PATH = "C:/Users/Claudiu/Downloads/agriculturedb-firebase-adminsdk-fbsvc-b25496b64b.json"

# --- Initialization Logic ---
# Check if the Firebase app has already been initialized (critical for reloads/testing)
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully.")
    except FileNotFoundError:
        print(f"Error: Service account key not found at {SERVICE_ACCOUNT_KEY_PATH}")

    except Exception as e:
        print(f"Error initializing Firebase: {e}")

db = firestore.client()
