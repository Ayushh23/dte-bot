from flask import Blueprint, request, jsonify, session
from datetime import datetime
from core.engine import chatbot

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/get_response', methods=['POST'])
def get_bot_response():
    data = request.json
    user_message = data.get('message', '')
    
    # Check for college change specifically
    if 'change college' in user_message.lower():
         session.pop('selected_college', None)
         return jsonify({
             'response': 'Okay, let\'s pick a new college.',
             'timestamp': datetime.now().strftime("%H:%M:%S"),
             'status': 'success',
             'action': 'select_college'
         })
    
    # If the user sets a college through UI logic
    if data.get('action') == 'set_college':
         college_id = data.get('college_id')
         col_data = chatbot.db.colleges.find_one({"_id": college_id}, {"name": 1})
         if col_data:
              session['selected_college'] = college_id
              name = col_data.get('name', 'College')
              return jsonify({
                   'response': f"You have selected {name}. How can I assist you specifically regarding this institution?",
                   'timestamp': datetime.now().strftime("%H:%M:%S"),
                   'status': 'success'
              })

    # Sync frontend state
    if 'college_id' in data:
         frontend_cid = data.get('college_id')
         if frontend_cid:
              session['selected_college'] = frontend_cid
         else:
              session.pop('selected_college', None)

    # Detect college from natural language
    detected_college_id = chatbot.detect_college(user_message)
    is_new_selection = False
    
    if detected_college_id and session.get('selected_college') != detected_college_id:
         session['selected_college'] = detected_college_id
         is_new_selection = True

    # Get selected college from session
    selected_college = session.get('selected_college')
    
    # Get response
    response = chatbot.find_response(user_message, selected_college, is_new_selection)
    
    return jsonify({
        'response': response,
        'timestamp': datetime.now().strftime("%H:%M:%S"),
        'status': 'success',
        'selected_college': selected_college
    })

@chat_bp.route('/api/colleges', methods=['GET'])
def get_colleges():
    return jsonify({'status': 'success', 'colleges': chatbot.get_colleges_list()})

@chat_bp.route('/api/conversation_history', methods=['GET'])
def get_conversation_history():
    return jsonify(chatbot.conversation_history[-10:])

@chat_bp.route('/api/analytics', methods=['GET'])
def get_analytics():
    total_questions = len(chatbot.conversation_history)
    return jsonify({
        'total_questions': total_questions,
        'success_rate': 95,
        'avg_response_time': 0.8
    })
