# 🎮 FlexGameFactory

**An AI-powered game factory that automatically transforms trending news into playable web games.**

FlexGameFactory is a fully automated pipeline: it fetches real-world news, generates themed HTML5 games with AI-selected board-game mechanics, creates cover art, and publishes everything — all with zero human intervention.

---

## ✨ How It Works

```
News API → Report → AI Game Builder → HTML5 Game + Cover Art → Git Push → Library
```

1. **News Search** — A FastAPI service (`news_search/`) fetches and summarizes trending news via the Gemini API, saving reports as `report.md` files into `junda_games/<topic>/`.
2. **Game Builder Worker** — A background worker (`game_builder_worker.py`) polls `junda_games/` for directories that have a `report.md` but no `index.html`. For each pending game, it invokes the Gemini CLI with the `generate_news_based_game` skill to autonomously build a full HTML/CSS/JS game.
3. **Cover Art Generation** — The skill uses the Nano Banana (Gemini image generation) API via `tools/nano_banana_gen.py` to produce a 16:9 `cover.png` for each game.
4. **Sync & Publish** — A sync worker (`sync_worker.py`) handles git auto-commit and push, keeping the remote repo up to date with newly generated games.
5. **Frontend Library** — A React + Vite frontend (`game-factory-fe/`) serves as a Steam-style game library where users can browse, play, and review generated games.

---

## 📂 Project Structure

```
FlexGameFactory/
├── news_search/              # FastAPI backend (news fetching, game listing, agent reviews)
│   ├── main.py               # API endpoints: /news, /games, /agents, /evaluate, /sync
│   └── gemini_service.py     # Gemini API integration for news synthesis & game reviews
├── game_builder_worker.py    # Background worker that auto-generates games from reports
├── sync_worker.py            # Git auto-sync daemon (commit + pull + push every 10s)
├── tools/
│   └── nano_banana_gen.py    # CLI tool for Gemini image generation (cover art & assets)
├── docs/                     # 185+ board game mechanic docs (JSON-structured reference)
├── junda/                    # Prototype game & skill development workspace
│   ├── generate_news_based_game/
│   │   └── SKILL.md          # The core skill: news → game generation workflow
│   └── docs_structure.json   # Indexed game mechanics reference for AI consumption
├── junda_games/              # Generated games directory (each game = a subdirectory)
│   ├── layoff_game/          # AI Layoff Survivor: 2026 Edition
│   ├── nba_2026_regular_season/
│   ├── 2026_fifa_world_cup/
│   ├── nasa_artemis_moon_landing/
│   ├── quantum_supremacy_milestones_2026/
│   ├── nfl_draft_2026_major/
│   ├── heavyweight_boxing_championships_2026/
│   ├── lab_grown_meat_commercialization/
│   └── ...                   # More games auto-generated from news
├── .agents/skills/           # Gemini CLI skills
│   ├── junda/generate_nano_banana_image/  # Image generation skill
│   └── Hayden/steam-style.md              # Steam-style UI skill
├── GameFactoryAgent/         # AI agent personas for automated game reviews
│   ├── *.json                # Agent configs (personality, balance, investment style)
│   ├── reviews/              # Generated review JSONs
│   └── reports/              # Human-readable review markdown reports
├── game-factory-fe/          # React + Vite frontend (game library UI)
├── presentation/             # Project demo presentation
└── gemini_auto_create.sh     # Example: single-shot game generation script
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed and configured
- `google-genai` Python SDK (`pip3 install google-genai`)

### 1. Set up environment
```bash
# Clone the repo
git clone https://github.com/AHEADer/FlexGameFactory.git
cd FlexGameFactory

# Set your Gemini API key
echo "GEMINI_API_KEY=your-api-key-here" > .env
```

### 2. Start the News API
```bash
cd news_search
pip install -r requirements.txt
python3 main.py
# API runs at http://localhost:8000
```

### 3. Generate a game manually
```bash
# Fetch a news report and save to junda_games/
curl "http://localhost:8000/news?query=mars+exploration"

# Or run the builder directly with the Gemini CLI
gemini -p "Use @[junda/generate_news_based_game/SKILL.md] to generate a game, theme can be found in news @[junda_games/mars_exploration/report.md]. Game files should be saved in the junda_games/mars_exploration dir." -y -m gemini-3-flash-preview
```

### 4. Run the auto-builder (fully autonomous mode)
```bash
# Start the game builder worker (polls for pending games every 10s)
python3 game_builder_worker.py

# In a separate terminal, start the git sync worker
python3 sync_worker.py
```

### 5. Launch the frontend
```bash
cd game-factory-fe
npm install
npm run dev
```

---

## 🎲 Game Mechanics Library

The `docs/` directory contains **185+ documented board game mechanisms** organized into categories:

| Category | Examples |
| :--- | :--- |
| **Game Structure** (STR) | Competitive, Cooperative, Solo, Traitor, Legacy |
| **Actions** (ACT) | Action Points, Worker Placement, Tech Trees, Rondel |
| **Movement** (MOV) | Roll & Move, Bias (Conveyor Belt), Programmed Movement |
| **Resolution** (RES) | Dice Combat, Rock-Paper-Scissors, Voting |
| **Economics** (ECO) | Markets, Trading, Loans, Auctions |
| **Uncertainty** (UNC) | Push-Your-Luck, Bluffing, Hidden Roles |
| **Victory** (VIC) | Victory Points, Player Elimination, Race, King of the Hill |
| **Card Mechanics** (CAR) | Trick-Taking, Deck Building, Drafting |

The AI reads these docs to select mechanics that thematically match each news report.

---

## 🤖 AI Agent Reviews

FlexGameFactory includes an agent-based review system where AI personas with different personalities and budgets evaluate and financially "invest" in generated games:

- **Agents** are defined as JSON configs with a name, personality prompt, and balance.
- **Reviews** are generated by the Gemini API based on the agent's personality and the game's source code.
- **Funding** tracks investment amounts per game from different agents.

Use the `/evaluate` endpoint to trigger an agent review, or browse reviews in the frontend.

---

## 🛠️ Key Skills

### `generate_news_based_game` (SKILL.md)
The core workflow skill that guides the AI through:
1. Analyzing a news report for themes
2. Selecting 2-3 matching game mechanics from the docs
3. Generating a game summary and cover image
4. Building a complete HTML/CSS/JS game with intro modal, difficulty scaling, and win/loss conditions
5. Playtesting via local HTTP server

### `generate_nano_banana_image` (SKILL.md)
A wrapper skill for generating images via the Gemini image generation API. Supports aspect ratios (1:1, 16:9, 4:3, 9:16) and resolutions (1K, 2K, 4K).

---

## 📜 License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
