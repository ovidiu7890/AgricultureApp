from flask import Blueprint, jsonify, request
from datetime import datetime

from DB.calendar_manager import (
    create_calendar_entry_db,
    get_user_calendar_db,
    update_calendar_entry_db,
    delete_calendar_entry_db
)

calendar_bp = Blueprint('calendar', __name__, url_prefix='/api/calendar')


@calendar_bp.route('/', methods=['GET'])
def get_calendar_entries():
    # Get userId from query parameters for GET request
    user_uid = request.args.get('userId')
    
    if not user_uid:
        return jsonify({"error": "userId query parameter required."}), 401

    try:
        entries = get_user_calendar_db(user_uid)
        return jsonify(entries), 200
    except Exception:
        return jsonify({"error": "Failed to retrieve calendar entries."}), 500


@calendar_bp.route('/', methods=['POST'])
def add_calendar_entry():
    data = request.get_json()

    required_fields = ['userId', 'plantName', 'date']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"error": f"Missing required fields: {required_fields}"}), 400

    try:
        date_object = datetime.strptime(data['date'], '%Y-%m-%d')

        new_entry_id = create_calendar_entry_db(
            user_uid=data['userId'],
            plant_name=data['plantName'],
            date=date_object,
            notes=data.get('notes')
        )

        return jsonify({"message": "Entry created.", "id": new_entry_id}), 201

    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
    except Exception:
        return jsonify({"error": "Failed to create calendar entry."}), 500


@calendar_bp.route('/<string:entry_id>', methods=['PUT'])
def update_calendar_entry(entry_id):
    data = request.get_json()

    if 'date' in data:
        try:
            data['date'] = datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format in update. Use YYYY-MM-DD."}), 400

    try:
        success = update_calendar_entry_db(entry_id, data)
        if success:
            return jsonify({"message": "Entry updated successfully."}), 200
        return jsonify({"error": "Entry not found or update failed."}), 404

    except Exception:
        return jsonify({"error": "Failed to update calendar entry."}), 500


@calendar_bp.route('/<string:entry_id>', methods=['DELETE'])
def delete_calendar_entry(entry_id):
    try:
        success = delete_calendar_entry_db(entry_id)
        if success:
            return jsonify({"message": "Entry deleted successfully."}), 200
        return jsonify({"error": "Entry not found."}), 404

    except Exception:
        return jsonify({"error": "Failed to delete calendar entry."}), 500