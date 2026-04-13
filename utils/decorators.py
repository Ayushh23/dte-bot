from functools import wraps
from flask import session, jsonify

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({'status': 'error', 'message': 'Admin authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function
