from flask import Flask, jsonify
from config import Config
from routes.chat import chat_bp
from routes.admin import admin_bp

app = Flask(__name__)
app.secret_key = Config.SECRET_KEY
app.url_map.strict_slashes = False

# Register Blueprints
app.register_blueprint(chat_bp)
app.register_blueprint(admin_bp)

@app.route('/')
def home():
    return jsonify({"status": "DTE BOT Matrix Backend Active", "version": "2.0.0 (Modular)"})

if __name__ == '__main__':
    print(f"Starting DTE Chatbot Backend on port {Config.PORT}...")
    app.run(debug=Config.DEBUG, host=Config.HOST, port=Config.PORT)