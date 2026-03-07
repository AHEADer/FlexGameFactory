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

@app.get("/news", response_model=List[NewsArticle])
async def get_news(category: Optional[str] = Query(None, description="The category of news to search for")):
    # If user doesn't specify a category, randomly choose one.
    if not category:
        category = get_random_category()
    
    # Only capitalize if it's a single word to match standard lists, 
    # but preserve casing for phrases/sentences.
    if " " not in category.strip():
        category = category.capitalize()
        
    print(f"Fetching news for query: {category} using Gemini")
    
    if not os.environ.get("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Server is missing GEMINI_API_KEY environment variable.")
    
    try:
        articles = fetch_and_summarize_news(category, limit=10)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")
    
    if not articles:
        raise HTTPException(status_code=404, detail=f"No news found for category '{category}'")
    
    result_articles = []
    
    for a in articles:
        result_articles.append(NewsArticle(
            title=a.get("title", "Untitled"),
            summary=a.get("summary", "Summary unavailable")[:2000], # Keep a reasonable cap
            url=a.get("url", ""),
            published=a.get("published", ""),
            source=a.get("source", "Unknown Source")
        ))

    return result_articles

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
