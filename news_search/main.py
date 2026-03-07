from fastapi import FastAPI, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel
import os

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
