import os
import random
import concurrent.futures
from datetime import datetime, timedelta
from ddgs import DDGS
from newspaper import Article, Config
from google import genai
from google.genai import types
from typing import List, Dict, Any
from dotenv import load_dotenv
import nltk

# Ensure punkt is available for newspaper if needed
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')

# Load environment variables from .env file
load_dotenv()

TOP_20_DOMAINS = [
    "cnn.com", "bbc.co.uk", "reuters.com", "nytimes.com", "theguardian.com",
    "foxnews.com", "washingtonpost.com", "bloomberg.com", "nbcnews.com",
    "aljazeera.com", "wsj.com", "usatoday.com", "apnews.com", "npr.org",
    "cnbc.com", "time.com", "cbsnews.com", "abcnews.go.com",
    "independent.co.uk", "ft.com"
]

CATEGORIES = [
    "World", "Politics", "Business", "Technology", "Science",
    "Health", "Sports", "Entertainment", "Lifestyle", "Environment"
]

def get_random_category() -> str:
    return random.choice(CATEGORIES)

def fetch_top_links(category: str, limit: int = 10) -> List[Dict[str, str]]:
    """
    Fetches the top news articles for a given category/query using DuckDuckGo News Search,
    filtered to the top 20 embedded domains and published within the last 3 weeks.
    """
    # Handle category as a "line" (phrase/query)
    full_query = category if " " in category.strip() else f"{category} news"
    
    articles = []
    three_weeks_ago = datetime.now() - timedelta(weeks=3)
    
    print(f"Querying DDG for: {full_query}")
    try:
        with DDGS() as ddgs:
            results = ddgs.news(keywords=full_query, max_results=100)
            for r in results:
                url = r.get("url", "")
                published_str = r.get("date", "")
                
                # Filter by domain
                if not any(domain in url for domain in TOP_20_DOMAINS):
                    continue
                
                # Filter by date (last 3 weeks)
                # DDGS date is usually in ISO format or similar: '2025-03-07T02:22:04+00:00'
                try:
                    # Strip timezone for simple comparison or use fromisoformat
                    # ddgs date format is '2024-03-07T10:30:41+08:00'
                    published_date = datetime.fromisoformat(published_str.replace("Z", "+00:00"))
                    # Make everything offset-aware or offset-naive for comparison
                    # Simplest is to make both naive (using local time or UTC)
                    if published_date.timestamp() < three_weeks_ago.timestamp():
                        continue
                except (ValueError, TypeError):
                    # If date parsing fails, we might still want the article but strictly we should skip if date is required
                    print(f"Warning: Could not parse date '{published_str}' for {url}")
                    pass

                articles.append({
                    "original_title": r.get("title", ""),
                    "url": url,
                    "published": published_str,
                    "source": r.get("source", "Unknown Source")
                })
                
                if len(articles) >= limit:
                    break
    except Exception as e:
        print(f"Error fetching from DDGS: {e}")
    return articles

def summarize_with_gemini(article_data: Dict[str, str], client: genai.Client) -> Dict[str, str]:
    """
    Scrapes the text of an article using Newspaper3k and then passes the text to Gemini
    to generate a 300-word summary and a meaningful title.
    """
    url = article_data["url"]
    original_title = article_data["original_title"]
    
    # 1. Scrape the article
    try:
        config = Config()
        config.browser_user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        config.request_timeout = 10
        article = Article(url, config=config, fetch_images=False)
        article.download()
        article.parse()
        article_text = article.text
        
        if not article_text or len(article_text) < 50:
            return {
                "title": original_title,
                "summary": "Content could not be retrieved from the source.",
                "url": url,
                "published": article_data["published"],
                "source": article_data["source"]
            }
            
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {
            "title": original_title,
            "summary": "Failed to extract content from the source.",
            "url": url,
            "published": article_data["published"],
            "source": article_data["source"]
        }

    # 2. Summarize with Gemini
    prompt = f"""
    You are an expert news summarizer.
    
    Article Original Title: {original_title}
    Article Text:
    {article_text[:6000]} 
    
    Your task:
    1. Generate a meaningful, concise title for this article.
    2. Provide a rich, detailed summary of Exactly roughly 300 words.
    
    Return the output STRICTLY as a raw JSON object. 
    Do not wrap the JSON in markdown codeblocks (no ```json ... ```).
    The object must have the following keys:
    - "title": The meaningful title.
    - "summary": The 300-word summary.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        response_text = response.text.strip()
            
        import json
        result = json.loads(response_text)
        
        return {
            "title": result.get("title", original_title),
            "summary": result.get("summary", "Summary generation failed."),
            "url": url,
            "published": article_data["published"],
            "source": article_data["source"]
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e).replace('"', "'")
        print(f"Error summarizing {url} with Gemini: {error_msg}")
        return {
            "title": original_title,
            "summary": f"Gemini generation failed: {error_msg}",
            "url": url,
            "published": article_data["published"],
            "source": article_data["source"]
        }

def fetch_and_summarize_news(category: str, limit: int = 10) -> List[Dict[str, str]]:
    """
    Orchestrates the hybrid approach:
    1. Fetches top 10 links via DDGS.
    2. Parallely scrapes and summarizes each link with Gemini.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    
    client = genai.Client(api_key=api_key)
    
    # 1. Fetch links
    raw_articles = fetch_top_links(category, limit)
    
    if not raw_articles:
        return []
    
    # 2. Summarize in parallel
    final_articles = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_article = {
            executor.submit(summarize_with_gemini, a, client): a 
            for a in raw_articles
        }
        
        for future in concurrent.futures.as_completed(future_to_article):
            try:
                final_articles.append(future.result())
            except Exception as exc:
                print(f"Article processing generated an exception: {exc}")
                
    return final_articles
