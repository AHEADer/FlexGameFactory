# HowToPlayNews (Game Factory Frontend)

This is the frontend application for **HowToPlayNews**, a platform where AI generates personalized desktop games based on the latest news, and AI Agents act as judges to playtest and invest in them.

## Requirements

- **Node.js**: v18 or higher recommended.
- **Python**: Python 3.9 or higher.
- **Git**: For version control and background game sync.
- **Gemini API Key**: Required for the backend news and game evaluation logic.

---

## 🚀 How to Run the Full Project Locally

To run this platform, you need to start the backend API server, the frontend React application, and optionally the background Git sync worker.

### 1. Setup Environment Variables
Navigate to the `news_search` folder and create a `.env` file (if you haven't already):
```bash
cd ../news_search
echo "GEMINI_API_KEY=your_google_gemini_api_key_here" > .env
```
*(Make sure to replace `your_google_gemini_api_key_here` with your actual API key.)*

### 2. Start the Backend API Server
The backend handles AI generation, agent reviews, and saving state.

Navigate to the `news_search` directory and activate the python virtual environment:
```bash
cd ../news_search
source venv/bin/activate
# If the venv doesn't exist yet, create it: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Start the FastAPI server (runs on port 8000 by default)
python main.py
```
*Note: You can also use `nohup python main.py > /tmp/backend.log 2>&1 &` to run it in the background.*

### 3. Start the Frontend App (This Folder Check)
Open a new terminal session, navigate to the `game-factory-fe` directory:

```bash
cd game-factory-fe

# Install node module dependencies (only needed the first time)
npm install

# Start the Vite development server
npm run dev
# OR to expose it on your local network:
npm run dev --host
```

The frontend will typically be available at **http://localhost:5173**. Open this URL in your browser.

### 4. (Optional) Start the Background Sync Worker
To ensure your local games library (`junda_games` directory) stays perfectly in sync with the cloud repository (pushing your new agent reviews and pulling in games generated from elsewhere), run the sync worker.

Open a new terminal session and navigate to the project root directory (`FlexGameFactory`):
```bash
cd ..
python3 sync_worker.py
```
This script will continually run in the background every 10 seconds to sync your Git repository automatically.

---

## 🎮 Features

- **Store/Play News**: Discover the latest generated news-themed games.
- **Library**: Manage your local collection of generated environments.
- **Agent Judges**: Create custom AI critics (Agents) with unique tastes (Prompts). Assign them to playtest generated games, evaluate mechanics, give scores, and fund/invest in games they love through interactive simulated crowdfunding!

## Tech Stack
- **Frontend**: React, Vite, CSS, Lucide-React Icons.
- **Backend API proxy mappings** are configured in `vite.config.js` to natively talk to `localhost:8000`.
