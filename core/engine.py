import json
import re
import random
from datetime import datetime
import google.generativeai as genai
from core.database import db
from config import Config

if Config.GEMINI_API_KEY and Config.GEMINI_API_KEY != 'paste_your_key_here':
    genai.configure(api_key=Config.GEMINI_API_KEY)

class ChatbotEngine:
    def __init__(self):
        self.db = db
        self.conversation_history = []
    
    def find_response(self, user_input, college_id=None, is_new_selection=False):
        user_input_lower = user_input.lower().strip()
        
        # Add to conversation history
        self.conversation_history.append({
            'user': user_input_lower,
            'timestamp': datetime.now().isoformat(),
            'college_id': college_id
        })
        
        # Check special responses first
        special_response = self.check_special_responses(user_input_lower, college_id)
        if special_response:
            return special_response
        
        # Determine which data block to search. Prioritize college specific, fallback to general.
        kb_data = []
        if college_id:
            col_data = self.db.colleges.find_one({"_id": college_id})
            if col_data:
                 kb_data.append(col_data)
        
        gen_data = self.db.general.find_one({"_id": "general"})
        if gen_data:
             kb_data.append(gen_data)
        
        # Quick search with priority matching
        best_match = self.quick_search(user_input_lower, kb_data)
        if best_match:
            if is_new_selection and college_id:
                 col_data = self.db.colleges.find_one({"_id": college_id})
                 name = col_data.get('name', '') if col_data else ''
                 return f"(Switched to **{name}**) <br><br> " + best_match
            return best_match
        
        # Hybrid AI Fallback (Gemini API)
        if college_id and Config.GEMINI_API_KEY and Config.GEMINI_API_KEY != 'paste_your_key_here':
             gemini_response = self.gemini_search(user_input_lower, college_id)
             if gemini_response:
                  return f"*(Gemini AI Generated)* ✨ <br><br> {gemini_response}"
        
        # Standard Fallback responses
        if college_id:
             if is_new_selection:
                  col_data = self.db.colleges.find_one({"_id": college_id})
                  name = col_data.get('name', 'this college') if col_data else 'this college'
                  return f"Got it! 🎓 You're asking about **{name}**. What specific info do you need? (Try asking about fees, admissions, or placements!)"
             return "Hmm, I don't have that exact information for this college right now! 🤔 Could you try asking about their courses, fees, or contact details?"
        
        fallback_responses = [
            "Hmm, my circuits missed that. 🤔 I'm your friendly DTE BOT! Could you try selecting a specific college first? (Like 'Tell me about Government Polytechnic College')",
            "Oops! I couldn't find exact information for that. 🤖 Try asking me about admissions, courses, or fees! If you haven't yet, let me know which college you're looking for.",
            "I'm still learning! 🌟 I specialize in DTE Rajasthan colleges. Try asking 'What are the courses at MBM Jodhpur?'"
        ]
        return random.choice(fallback_responses)
    
    def quick_search(self, user_input, kb_data_blocks):
        # Priority-based matching mapped sequentially over data blocks
        for block in kb_data_blocks:
            if 'categories' not in block: continue
            for category in block['categories']:
                if 'questions' not in category: continue
                for question in category['questions']:
                    for pattern in question['patterns']:
                        if re.search(r'\b' + re.escape(pattern), user_input, re.IGNORECASE):
                            return random.choice(question['responses'])
        return None
        
    def gemini_search(self, user_input, college_id):
        """Hybrid AI fallback using Gemini for questions not in the static knowledge base."""
        college_data = self.db.colleges.find_one({"_id": college_id}) or {}
        college_name = college_data.get('name', 'Unknown College')
        college_city = college_data.get('city', '')
        
        # Build a clean data summary for the prompt (strip internal keys)
        safe_data = {k: v for k, v in college_data.items() if k not in ('categories', '_id')}
        # Include category summaries
        categories_summary = []
        for cat in college_data.get('categories', []):
            for q in cat.get('questions', []):
                for resp in q.get('responses', []):
                    categories_summary.append(resp)
        
        context_block = "\n".join(categories_summary) if categories_summary else json.dumps(safe_data, indent=2)
        
        prompt = f"""You are 'DTE BOT', a professional and helpful student assistant for the Department of Technical Education, Rajasthan.

A student is asking about **{college_name}**{f' in {college_city}' if college_city else ''}.

Here is ALL the verified data you have about this college:
---
{context_block}
---

Rules:
1. Answer ONLY based on the data provided above. Do NOT invent facts.
2. If the answer is not in the data, politely say you don't have that specific information and suggest what data IS available (fees, admissions, placements, hostels, contact).
3. Keep the answer concise (2-4 sentences max).
4. Use a warm, professional tone. Use emojis sparingly (1-2 max).
5. Format your reply using simple Markdown (bold with **, line breaks with \n).

Student's Question: "{user_input}"
"""
        try:
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=300,
                    temperature=0.3
                )
            )
            if response and response.text:
                return response.text.replace("\n", "<br/>")
            return None
        except Exception as e:
            print(f"Gemini API Error for {college_name}: {e}")
            return None

    def check_special_responses(self, user_input, college_id):
        special_cases = {
            r'\b(hello|hi|hey|namaste|ram ram|khamma ghani)\b': [
                "Ram Ram! 🌸 Welcome to DTE Rajasthan Student Assistant! How can I help you today?",
                "Khamma Ghani! 😊 I'm here to assist you. Which college are you looking for?",
                "Hello! 🎓 Ready to explore technical education in Rajasthan? Select a college to start!"
            ],
            r'\b(thank you|thanks|dhanyabad)\b': [
                "You're most welcome! 😊 Build a bright future in Rajasthan.",
                "Happy to help! 🌟"
            ],
            r'\b(bye|goodbye|see you)\b': [
                "Goodbye! 👋 Best wishes!",
                "Ram Ram! 🌸 Visit hte.rajasthan.gov.in for updates!"
            ]
        }
        for pattern, responses in special_cases.items():
            if re.search(pattern, user_input, re.IGNORECASE):
                return random.choice(responses)
        return None
    
    def detect_college(self, user_input):
        user_input_lower = user_input.lower()
        # Stop words that are too generic to identify a college
        stop_words = {'college', 'government', 'polytechnic', 'engineering', 'university', 'institute', 'technical'}
        
        # Read all colleges from MongoDB for processing
        all_colleges = list(self.db.colleges.find({}, {"_id": 1, "name": 1}))
        for data in all_colleges:
            cid = data["_id"]
            name = data.get('name', '').lower()
            # Full name match (highest priority)
            if name and name in user_input_lower:
                return cid
            # Partial keyword match — extract meaningful words (4+ chars, not stop words)
            keywords = [w for w in name.split() if len(w) >= 4 and w not in stop_words]
            if keywords and any(kw in user_input_lower for kw in keywords):
                return cid
        return None
        
    def add_question(self, college_id, category, patterns, response):
        if college_id == "general":
            target = self.db.general.find_one({"_id": "general"})
            collection = self.db.general
            lookup_id = "general"
        else:
            target = self.db.colleges.find_one({"_id": college_id})
            collection = self.db.colleges
            lookup_id = college_id
            
        if not target:
            return False

        if 'categories' not in target:
            target['categories'] = []
            
        cat_found = False
        for cat in target['categories']:
            if cat['name'] == category:
                cat_found = True
                if 'questions' not in cat:
                     cat['questions'] = []
                cat['questions'].append({
                    "patterns": patterns,
                    "responses": [response]
                })
                break
        
        if not cat_found:
            target['categories'].append({
                "name": category,
                "questions": [{
                    "patterns": patterns,
                    "responses": [response]
                }]
            })
        
        collection.update_one({"_id": lookup_id}, {"$set": {"categories": target['categories']}})
        return True

    def get_colleges_list(self):
        colleges = []
        for data in self.db.colleges.find({}, {"_id": 1, "name": 1, "city": 1}):
             colleges.append({"id": data["_id"], "name": data.get("name", data["_id"]), "city": data.get("city", "")})
        return colleges

# Initialize an engine instance for global use if needed, 
# though Blueprints will likely create their own or use a shared one.
chatbot = ChatbotEngine()
