from google.cloud import firestore
from .firebase_config import db

def create_calendar_entry_db(user_uid, plant_name, date, notes=None):
    try:
        entry_data = {
            'userId': user_uid,
            'plantName': plant_name,
            'date': date,
            'notes': notes if notes else "",
            'createdAt': firestore.SERVER_TIMESTAMP
        }

        entries_ref = db.collection('calendarEntries')
        doc_ref_tuple = entries_ref.add(entry_data)

        return doc_ref_tuple[1].id

    except Exception as e:
        print(f"Error creating calendar entry for user {user_uid}: {e}")
        raise


def get_user_calendar_db(user_uid):
    try:
        entries_ref = db.collection('calendarEntries')

        # Query without order_by to avoid Firestore index issues
        query = entries_ref.where('userId', '==', user_uid)

        entries_list = []
        for doc in query.stream():
            entry_data = doc.to_dict()
            entry_data['id'] = doc.id

            # Convert date to string if it's a datetime object
            if 'date' in entry_data and entry_data['date'] is not None:
                if hasattr(entry_data['date'], 'strftime'):
                    # It's a datetime object
                    entry_data['date'] = entry_data['date'].strftime('%Y-%m-%d')
                # If it's already a string, leave it as is

            entries_list.append(entry_data)

        print(f"Found {len(entries_list)} calendar entries for user {user_uid}")
        return entries_list

    except Exception as e:
        print(f"Error fetching calendar for user {user_uid}: {e}")
        import traceback
        traceback.print_exc()
        raise

def update_calendar_entry_db(entry_id, update_fields):
    try:
        entry_ref = db.collection('calendarEntries').document(entry_id)
        entry_ref.update(update_fields)
        return True
    except Exception as e:
        print(f"Error updating calendar entry {entry_id}: {e}")
        raise


def delete_calendar_entry_db(entry_id):
    try:
        entry_ref = db.collection('calendarEntries').document(entry_id)

        if not entry_ref.get().exists:
            return False

        entry_ref.delete()
        return True
    except Exception as e:
        print(f"Error deleting calendar entry {entry_id}: {e}")
        raise