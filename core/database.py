from pymongo import MongoClient
from config import Config

def get_db():
    if not Config.MONGO_URI:
        print("Warning: MONGO_URI not found.")
        return None
    client = MongoClient(Config.MONGO_URI)
    return client['DTEChatBot']

db = get_db()
