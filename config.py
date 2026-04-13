import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    MONGO_URI = os.getenv('MONGO_URI')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dte_chatbot_secret_key')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    PORT = int(os.getenv('PORT', 5000))
    HOST = '0.0.0.0'
