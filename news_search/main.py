from fastapi import FastAPI, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel
import os
import json
import re
from datetime import datetime

from gemini_service import fetch_and_summarize_news, get_random_category

app = FastAPI(
    title="FastP API News Server",
    description="An API server that fetches and summarizes top news using the Gemini API.",
    version="1.0.0"
)

class NewsArticle(BaseModel):
    title: str
    summary: str
    url: str
    published: str
    source: str

class AgentConfig(BaseModel):
    name: str
    prompt: str
    id: Optional[str] = None
    balance: float = 0.0

class ReviewRequest(BaseModel):
    agent_id: str
    game_id: str

@app.get("/news")
async def get_news(query: Optional[str] = Query(None, description="The query of news to search for")):
    # If user doesn't specify a query, randomly choose one.
    if not query:
        query = get_random_category()
    
    # Only capitalize if it's a single word to match standard lists, 
    # but preserve casing for phrases/sentences.
    if " " not in query.strip():
        query = query.capitalize()
        
    print(f"Fetching news for query: {query} using Gemini synthesis")
    
    if not os.environ.get("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Server is missing GEMINI_API_KEY environment variable.")
    
    try:
        # This now returns the full Markdown report string
        report = fetch_and_summarize_news(query, limit=10)
        
        # --- NEW: Save report to junda_games ---
        try:
            import re
            from datetime import datetime
            
            # Create a very simple folder name
            clean_name = re.sub(r'[^a-zA-Z0-9]', '_', query.strip()).lower()
            # Take first 4 words and remove extra underscores
            folder_name = "_".join([w for w in clean_name.split("_") if w][:4])
            
            root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
            target_dir = os.path.join(root_dir, "junda_games", folder_name)
            
            os.makedirs(target_dir, exist_ok=True)
            # Save markdown file as fixed 'report.md'
            file_path = os.path.join(target_dir, "report.md")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(report)
            
            print(f"[Storage] Saved news report to: {file_path}")
        except Exception as storage_err:
            print(f"[Storage] Error saving report: {str(storage_err)}")
        # ---------------------------------------

        from fastapi import Response
        return Response(content=report, media_type="text/markdown")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@app.get("/sync")
async def sync_repository():
    """Triggers a git pull --rebase on the repository to sync latest game assets."""
    import subprocess
    import os
    
    # Target the root directory (parent of news_search)
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    print(f"[Sync] Starting git pull in {root_dir}")
    try:
        result = subprocess.run(
            ["git", "pull", "--rebase", "origin", "main"],
            cwd=root_dir,
            capture_output=True,
            text=True,
            check=True
        )
        print(f"[Sync] Success: {result.stdout}")
        return {
            "success": True, 
            "message": "Repository synced successfully", 
            "output": result.stdout
        }
    except subprocess.CalledProcessError as e:
        print(f"[Sync] Error: {e.stderr}")
        return {
            "success": False, 
            "error": e.stderr if e.stderr else str(e),
            "output": e.stdout
        }
    except Exception as e:
        print(f"[Sync] Critical Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Sync Worker Control Endpoints ---

def get_sync_worker_pid():
    import subprocess
    try:
        # ps rx output to find sync_worker.py process id
        res = subprocess.run(["pgrep", "-f", "python3.*sync_worker\\.py"], capture_output=True, text=True)
        pids = res.stdout.strip().split('\n')
        pids = [p for p in pids if p]
        if pids:
            return int(pids[0])
    except Exception:
        pass
    return None

@app.get("/sync/status")
async def get_sync_worker_status():
    pid = get_sync_worker_pid()
    return {"running": pid is not None, "pid": pid}

@app.post("/sync/start")
async def start_sync_worker():
    pid = get_sync_worker_pid()
    if pid is not None:
        return {"success": True, "message": "Worker is already running", "pid": pid, "running": True}
        
    import subprocess
    import os
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    log_file = os.path.join(root_dir, "sync_worker.log")
    
    # Start process detached
    try:
        with open(log_file, "a") as f:
            proc = subprocess.Popen(
                ["python3", "sync_worker.py"], 
                cwd=root_dir, 
                stdout=f, 
                stderr=f,
                start_new_session=True # Detach from parent
            )
        return {"success": True, "message": "Worker started", "pid": proc.pid, "running": True}
    except Exception as e:
        return {"success": False, "message": str(e), "running": False}

@app.post("/sync/stop")
async def stop_sync_worker():
    import os
    import signal
    pid = get_sync_worker_pid()
    if pid is None:
         return {"success": True, "message": "Worker was not running", "running": False}
    
    try:
        os.kill(pid, signal.SIGTERM)
        # Verify it's dead
        import time
        time.sleep(0.5)
        if get_sync_worker_pid() is not None:
             os.kill(pid, signal.SIGKILL)
        return {"success": True, "message": "Worker stopped", "running": False}
    except Exception as e:
        return {"success": False, "message": f"Failed to stop: {e}", "running": get_sync_worker_pid() is not None}

# --- Agent & Review Endpoints ---

AGENTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "GameFactoryAgent"))
REVIEWS_DIR = os.path.join(AGENTS_DIR, "reviews")
REPORTS_DIR = os.path.join(AGENTS_DIR, "reports")

os.makedirs(AGENTS_DIR, exist_ok=True)
os.makedirs(REVIEWS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

@app.get("/agents")
async def list_agents():
    agents = []
    if os.path.exists(AGENTS_DIR):
        for f in os.listdir(AGENTS_DIR):
            if f.endswith(".json"):
                try:
                    with open(os.path.join(AGENTS_DIR, f), "r") as j:
                        agents.append(json.load(j))
                except:
                    pass
    return {"success": True, "agents": agents}

@app.post("/agents")
async def create_agent(config: AgentConfig):
    if not config.id:
        config.id = re.sub(r'[^a-zA-Z0-9]', '_', config.name).lower()
    
    file_path = os.path.join(AGENTS_DIR, f"{config.id}.json")
    with open(file_path, "w") as f:
        json.dump(config.dict(), f)
    
    return {"success": True, "agent": config}

@app.get("/games")
async def list_games():
    """Lists games from the junda_games directory."""
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    junda_dir = os.path.join(root_dir, "junda_games")
    games = []
    if os.path.exists(junda_dir):
        for d in os.listdir(junda_dir):
            if os.path.isdir(os.path.join(junda_dir, d)):
                games.append({"id": d, "name": d.replace("_", " ").title()})
    return {"success": True, "games": games}

FUNDING_FILE = os.path.join(AGENTS_DIR, "funding.json")

def get_funding():
    if os.path.exists(FUNDING_FILE):
        with open(FUNDING_FILE, "r") as f:
            return json.load(f)
    return {}

def save_funding(data):
    with open(FUNDING_FILE, "w") as f:
        json.dump(data, f)

@app.get("/funding")
async def get_funding_status():
    return {"success": True, "funding": get_funding()}

@app.get("/reviews")
async def list_reviews(game_id: Optional[str] = None):
    reviews = []
    if os.path.exists(REVIEWS_DIR):
        for f in os.listdir(REVIEWS_DIR):
            if f.endswith(".json"):
                try:
                    with open(os.path.join(REVIEWS_DIR, f), "r") as j:
                        data = json.load(j)
                        if not game_id or data.get("game_id") == game_id:
                            reviews.append(data)
                except:
                    pass
    return {"success": True, "reviews": reviews}

@app.post("/evaluate")
async def evaluate_game(req: ReviewRequest):
    print(f"[AgentReview] Agent {req.agent_id} evaluating game {req.game_id}")
    
    try:
        agent_path = os.path.join(AGENTS_DIR, f"{req.agent_id}.json")
        with open(agent_path, "r") as f:
            agent = json.load(f)
        
        # Load game code
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        game_index_path = os.path.join(root_dir, "junda_games", req.game_id, "index.html")
        
        game_code = "No source found."
        if os.path.exists(game_index_path):
            with open(game_index_path, "r") as f:
                game_code = f.read()
        
        # Import the helper
        from gemini_service import review_game_with_gemini
        
        # Run AI review
        ai_res = review_game_with_gemini(game_code, agent["prompt"], agent.get("balance", 0))
        
        tip = ai_res.get("tip_amount", 0)
        # Apply transaction
        agent["balance"] = max(0, agent.get("balance", 0) - tip)
        with open(agent_path, "w") as f:
            json.dump(agent, f)
            
        # Update game funding
        funding = get_funding()
        game_fund = funding.get(req.game_id, {"total": 0, "goal": 1000, "investors": []})
        game_fund["total"] += tip
        if tip > 0:
            game_fund["investors"].append({"agent_id": req.agent_id, "amount": tip, "date": datetime.now().isoformat()})
        funding[req.game_id] = game_fund
        save_funding(funding)

        review = {
            "id": f"rev_{int(datetime.now().timestamp())}",
            "agent_id": req.agent_id,
            "agent_name": agent["name"],
            "game_id": req.game_id,
            "score": ai_res.get("score", 0),
            "feedback": ai_res.get("feedback", "AI evaluation failed to generate feedback."),
            "tip_amount": tip,
            "timestamp": datetime.now().isoformat()
        }
        
        review_path = os.path.join(REVIEWS_DIR, f"{review['id']}.json")
        with open(review_path, "w") as f:
            json.dump(review, f)
        
        # Also create a human readable report file in GameFactoryAgent/reports
        try:
            report_filename = f"{req.game_id}_{req.agent_id}_{int(datetime.now().timestamp())}.md"
            report_path = os.path.join(REPORTS_DIR, report_filename)
            with open(report_path, "w", encoding="utf-8") as f:
                f.write(f"# Agent Review & Investment Report\n\n")
                f.write(f"- **Game:** {req.game_id}\n")
                f.write(f"- **Agent:** {agent['name']}\n")
                f.write(f"- **Score:** {review['score']}/100\n")
                f.write(f"- **Tip/Investment:** ${tip}\n")
                f.write(f"- **Date:** {review['timestamp']}\n\n")
                f.write(f"## Qualitative Assessment\n\n")
                f.write(f"{review['feedback']}\n")
            print(f"[AgentReview] Generated markdown report at: {report_path}")
        except Exception as report_err:
            print(f"[AgentReview] Failed to generate markdown report: {report_err}")
            
        return {"success": True, "review": review, "agent_balance": agent["balance"], "funding": game_fund}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
