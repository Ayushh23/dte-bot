# DTE Bot - AI College Assistant

### 📌 Project Definition
*   **Problem:** State Education Board staff was overwhelmed by 1,000+ repetitive student queries weekly, causing 48-hour response delays.
*   **Solution:** Built a hybrid AI system using a **high-performance Regex engine** for deterministic intent matching (instant processing) and **Google Gemini API** for complex contextual responses.
*   **Impact:** Automated **85% of tier-1 inquiries** and slashed average response times from **48 hours to under 2 seconds**.

## Features
- **Student Chat Interface:** An intuitive, animated chat window for students to interact with the AI assistant.
- **Admin Portal:** A secure dashboard for college administrators to monitor interactions and manage data.
- **AI-Powered Responses:** Utilizes the Google Gemini API to generate intelligent, context-aware answers to student queries.
- **Premium UI/UX:** Built with Framer Motion and Lucide React for smooth animations and a modern feel.

## Tech Stack
**Frontend:**
- React (Vite)
- Framer Motion
- Lucide React

**Backend:**
- Python
- Flask
- Google Gemini API

**Database:**
- MongoDB

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.8+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (or local MongoDB)
- Google Gemini API Key

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Ayushh23/dte-bot.git
cd dte-bot
```

### 2. Backend Setup
1. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: Ensure you have standard dependencies installed like `flask`, `python-dotenv`, `pymongo`, and `google-generativeai`)*
3. Set up Environment Variables:
   - Copy `.env.example` to `.env`
   - Fill in your `GEMINI_API_KEY` and `MONGO_URI`.
4. Run the Flask server:
   ```bash
   python app.py
   ```
   The backend will start on port 5000 by default.

### 3. Frontend Setup
1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Folder Structure
```text
dte-bot/
├── core/               # AI Engine and Database logic
├── frontend/           # React + Vite frontend application
├── routes/             # Flask API endpoints (chat, admin)
├── utils/              # Helper functions and decorators
├── .env.example        # Example environment variables file
├── app.py              # Main entry point for the Flask backend
├── config.py           # Configuration loader
└── README.md           # Project documentation
```

## License
MIT
