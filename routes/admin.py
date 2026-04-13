from flask import Blueprint, request, jsonify, session
import re
import random
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from core.engine import chatbot
from utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    admin_data = chatbot.db.admins.find_one({"_id": username})
    
    if admin_data and check_password_hash(admin_data.get("password", ""), password):
        session['admin_logged_in'] = True
        session['admin_college_id'] = admin_data.get("college_id")
        return jsonify({
            'status': 'success', 
            'message': 'Login successful', 
            'college_id': session['admin_college_id']
        })
    else:
        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

@admin_bp.route('/admin/signup', methods=['POST'])
def admin_signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    college_name = data.get('college_name')
    college_city = data.get('city', '')
    
    # Onboarding fields
    adm_dates = data.get('adm_dates')
    adm_exam = data.get('adm_exam', 'N/A')
    adm_cutoff = data.get('adm_cutoff', 'N/A')
    
    phone = data.get('phone')
    email = data.get('email', 'N/A')
    address = data.get('address', 'N/A')
    
    top_companies = data.get('top_companies')
    highest_package = data.get('highest_package', 'N/A')
    average_package = data.get('average_package', 'N/A')
    
    courses = data.get('courses', [])
    
    hostel_options = data.get('hostel_options')
    hostel_fees = data.get('hostel_fees', 'N/A')
    
    if not all([username, password, college_name, adm_dates, phone, top_companies, courses, hostel_options]):
        return jsonify({'status': 'error', 'message': 'All main onboarding fields are required'}), 400
    
    if chatbot.db.admins.find_one({"_id": username}):
        return jsonify({'status': 'error', 'message': 'Username already exists'}), 400
        
    if adm_exam and adm_exam != 'N/A':
        admission_text = f"Registration dates are **{adm_dates}**. Entrance exam accepted is **{adm_exam}** with a cutoff/requirement of **{adm_cutoff}**."
    else:
        admission_text = f"Registration dates are **{adm_dates}**. Admission is based on **merit/direct admission** (no entrance exam required)."
    contact_text = f"Phone: **{phone}**\nEmail: **{email}**\nAddress: **{address}**"
    placements_text = f"Top recruiters include **{top_companies}**. The highest package is **{highest_package}**, and the average package is **{average_package}**."
    
    courses_bullets = "\n".join([f"• **{c.get('name', 'Unknown')}**: {c.get('fee', 'N/A')}" for c in courses])
    courses_text = f"The following courses and fee structures are available:\n\n{courses_bullets}"
    
    hostels_text = f"Hostel facilities: **{hostel_options}**.\nThe hostel fees are **{hostel_fees}**."
    
    base_id = re.sub(r'[^a-zA-Z0-9]', '', college_name.lower().replace(' ', '_'))[:15]
    college_id = f"college_{base_id}_{random.randint(100, 999)}"
    
    hashed_password = generate_password_hash(password)
    
    # 1. Insert Admin
    chatbot.db.admins.insert_one({
        "_id": username,
        "password": hashed_password,
        "college_id": college_id
    })
    
    # 2. Insert College
    chatbot.db.colleges.insert_one({
        "_id": college_id,
        "name": college_name,
        "city": college_city,
        "categories": [
            {
                "name": "admissions",
                "questions": [{
                    "patterns": ["admission", "dates", "start", "last date", "entrance", "exam", "cutoff"],
                    "responses": [f"🎓 **Admissions Details**\n\nHere is the admission information for **{college_name}**:\n\n{admission_text}"]
                }]
            },
            {
                "name": "contact",
                "questions": [{
                    "patterns": ["contact", "phone", "email", "address", "location"],
                    "responses": [f"📞 **Contact Information**\n\nYou can reach out to **{college_name}** using the following details:\n\n{contact_text}"]
                }]
            },
            {
                "name": "placements",
                "questions": [{
                    "patterns": ["placement", "company", "recruiters", "highest package", "percentage", "average"],
                    "responses": [f"💼 **Placement Records**\n\nRegarding placements at **{college_name}**:\n\n{placements_text}"]
                }]
            },
            {
                "name": "courses & fees",
                "questions": [{
                    "patterns": ["course", "fee", "cost", "branches", "programs", "structure", "annual"],
                    "responses": [f"📚 **Courses & Fees**\n\nThe offered courses and fee structure for **{college_name}** are as follows:\n\n{courses_text}"]
                }]
            },
            {
                "name": "hostels",
                "questions": [{
                    "patterns": ["hostel", "accommodation", "stay", "mess", "boarding"],
                    "responses": [f"🏢 **Hostel & Accommodation**\n\nDetails about hostel facilities at **{college_name}**:\n\n{hostels_text}"]
                }]
            }
        ]
    })
    
    # Auto-login after signup
    session['admin_logged_in'] = True
    session['admin_college_id'] = college_id
    
    return jsonify({
        'status': 'success',
        'message': 'Signup and onboarding successful! Welcome to DTE.',
        'college_id': college_id
    })

@admin_bp.route('/admin/update_college', methods=['PUT'])
@admin_required
def update_college():
    data = request.json
    admin_cid = session.get('admin_college_id')
    
    college = chatbot.db.colleges.find_one({"_id": admin_cid})
    if not college:
        return jsonify({'status': 'error', 'message': 'College not found'}), 404
        
    college_name = college.get('name', 'College')
    update_fields = {}
    
    if 'city' in data:
        update_fields['city'] = data['city']
    
    new_categories = []
    
    # Admissions
    adm = data.get('admissions', {})
    if adm:
        adm_dates = adm.get('dates', '')
        adm_exam = adm.get('exam', 'N/A')
        adm_cutoff = adm.get('cutoff', 'N/A')
        if adm_exam and adm_exam != 'N/A':
            admission_text = f"Registration dates are **{adm_dates}**. Entrance exam accepted is **{adm_exam}** with a cutoff/requirement of **{adm_cutoff}**."
        else:
            admission_text = f"Registration dates are **{adm_dates}**. Admission is based on **merit/direct admission** (no entrance exam required)."
        new_categories.append({
            "name": "admissions",
            "questions": [{
                "patterns": ["admission", "dates", "start", "last date", "entrance", "exam", "cutoff"],
                "responses": [f"🎓 **Admissions Details**\n\nHere is the admission information for **{college_name}**:\n\n{admission_text}"]
            }]
        })
    
    # Contact
    contact = data.get('contact', {})
    if contact:
        phone = contact.get('phone', 'N/A')
        email = contact.get('email', 'N/A')
        address = contact.get('address', 'N/A')
        contact_text = f"Phone: **{phone}**\nEmail: **{email}**\nAddress: **{address}**"
        new_categories.append({
            "name": "contact",
            "questions": [{
                "patterns": ["contact", "phone", "email", "address", "location"],
                "responses": [f"📞 **Contact Information**\n\nYou can reach out to **{college_name}** using the following details:\n\n{contact_text}"]
            }]
        })
    
    # Placements
    plc = data.get('placements', {})
    if plc:
        top_companies = plc.get('top_companies', 'N/A')
        highest_package = plc.get('highest_package', 'N/A')
        average_package = plc.get('average_package', 'N/A')
        placements_text = f"Top recruiters include **{top_companies}**. The highest package is **{highest_package}**, and the average package is **{average_package}**."
        new_categories.append({
            "name": "placements",
            "questions": [{
                "patterns": ["placement", "company", "recruiters", "highest package", "percentage", "average"],
                "responses": [f"💼 **Placement Records**\n\nRegarding placements at **{college_name}**:\n\n{placements_text}"]
            }]
        })
    
    # Courses & Fees
    courses = data.get('courses', [])
    if courses:
        courses_bullets = "\n".join([f"• **{c.get('name', 'Unknown')}**: {c.get('fee', 'N/A')}" for c in courses])
        courses_text = f"The following courses and fee structures are available:\n\n{courses_bullets}"
        new_categories.append({
            "name": "courses & fees",
            "questions": [{
                "patterns": ["course", "fee", "cost", "branches", "programs", "structure", "annual"],
                "responses": [f"📚 **Courses & Fees**\n\nThe offered courses and fee structure for **{college_name}** are as follows:\n\n{courses_text}"]
            }]
        })
    
    # Hostels
    hostel = data.get('hostel', {})
    if hostel:
        hostel_options = hostel.get('options', 'N/A')
        hostel_fees = hostel.get('fees', 'N/A')
        hostels_text = f"Hostel facilities: **{hostel_options}**.\nThe hostel fees are **{hostel_fees}**."
        new_categories.append({
            "name": "hostels",
            "questions": [{
                "patterns": ["hostel", "accommodation", "stay", "mess", "boarding"],
                "responses": [f"🏢 **Hostel & Accommodation**\n\nDetails about hostel facilities at **{college_name}**:\n\n{hostels_text}"]
            }]
        })
    
    # Preserve any extra custom categories added via "Add Logic"
    standard_names = {'admissions', 'contact', 'placements', 'courses & fees', 'hostels'}
    for existing_cat in college.get('categories', []):
        if existing_cat.get('name', '').lower() not in standard_names:
            new_categories.append(existing_cat)
    
    update_fields['categories'] = new_categories
    chatbot.db.colleges.update_one({"_id": admin_cid}, {"$set": update_fields})
    
    return jsonify({'status': 'success', 'message': 'College data updated successfully!'})

@admin_bp.route('/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_logged_in', None)
    session.pop('admin_college_id', None)
    return jsonify({'status': 'success', 'message': 'Logout successful'})

@admin_bp.route('/admin/check_auth', methods=['GET'])
def check_admin_auth():
    if session.get('admin_logged_in'):
        return jsonify({'authenticated': True, 'college_id': session.get('admin_college_id')})
    return jsonify({'authenticated': False})

@admin_bp.route('/admin/knowledge_base', methods=['GET'])
@admin_required
def get_knowledge_base():
    admin_cid = session.get('admin_college_id')
    if admin_cid == "general":
         doc = chatbot.db.general.find_one({"_id": "general"}, {"_id": 0})
         return jsonify(doc or {})
    else:
         doc = chatbot.db.colleges.find_one({"_id": admin_cid}, {"_id": 0})
         return jsonify(doc or {})

@admin_bp.route('/admin/add_question', methods=['POST'])
@admin_required
def add_question():
    data = request.json
    category = data.get('category')
    question_title = data.get('question_title')
    patterns = data.get('patterns')
    answer = data.get('answer')
    
    admin_cid = session.get('admin_college_id')
    
    if not all([category, question_title, patterns, answer]):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400
    
    formatted_answer = f"❓ **Q: {question_title}**\n\n💡 **A:** {answer}"
    success = chatbot.add_question(admin_cid, category, patterns, formatted_answer)
    
    if success:
        return jsonify({'status': 'success', 'message': 'Question added successfully'})
    else:
        return jsonify({'status': 'error', 'message': 'Failed to add question'}), 500

@admin_bp.route('/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    admin_cid = session.get('admin_college_id')
    
    if admin_cid == "general":
         target = chatbot.db.general.find_one({"_id": "general"}) or {}
    else:
         target = chatbot.db.colleges.find_one({"_id": admin_cid}) or {}
    
    total_questions = 0
    categories = target.get('categories', [])
    for category in categories:
        total_questions += len(category.get('questions', []))
    
    return jsonify({
        'total_questions': total_questions,
        'total_categories': len(categories),
        'conversation_count': len([c for c in chatbot.conversation_history if c.get('college_id') == admin_cid])
    })
