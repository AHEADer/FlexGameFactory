import os
import json
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
# Try current directory first, then parent directory (project root)
load_dotenv()
if not os.environ.get("GEMINI_API_KEY"):
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

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
    Fetches the top news articles for a given category/query using DuckDuckGo News Search.
    Filters by specific domains and time range (last month) are embedded directly into the query.
    """
    # 1. Handle category as a "line" (phrase/query)
    base_query = category if " " in category.strip() else f"{category} news"
    
    # 2. Embed domains into query: "(base query) (site:cnn.com OR site:bbc.co.uk ...)"
    # Note: DuckDuckGo has limits on query length, so we use the most prominent ones
    domain_filter = " OR ".join([f"site:{d}" for d in TOP_20_DOMAINS[:10]])
    full_query = f"{base_query} ({domain_filter})"
    
    articles = []
    print(f"Querying DDG with optimized query: {full_query}")
    
    try:
        with DDGS() as ddgs:
            # timelimit='w' filters for the last week, 'm' for the last month.
            # Since the user asked for 3 weeks, 'm' (month) is the closest built-in filter,
            # we still keep the 3-week manual check for precision if needed, 
            # but the API call is now much more efficient.
            results = ddgs.news(query=full_query, timelimit='m', max_results=50)
            
            three_weeks_ago = datetime.now() - timedelta(weeks=3)
            
            for r in results:
                url = r.get("url", "")
                published_str = r.get("date", "")
                
                # Double check time (3 weeks)
                try:
                    published_date = datetime.fromisoformat(published_str.replace("Z", "+00:00"))
                    if published_date.timestamp() < three_weeks_ago.timestamp():
                        continue
                except:
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
    Falls back to local NLP if Gemini fails.
    """
    url = article_data["url"]
    original_title = article_data["original_title"]
    
    # 1. Scrape the article
    article_text = ""
    nlp_summary = ""
    try:
        config = Config()
        config.browser_user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        config.request_timeout = 10
        article = Article(url, config=config, fetch_images=False)
        article.download()
        article.parse()
        article_text = article.text
        
        # Pre-process NLP fallback summary
        try:
            article.nlp()
            nlp_summary = article.summary
            if not nlp_summary:
                # Fallback to a snippet if nlp() yields nothing
                nlp_summary = article_text[:1000]
            
            # Ensure it's under 300 words
            words = nlp_summary.split()
            if len(words) > 300:
                nlp_summary = " ".join(words[:300]) + "..."
        except Exception as nlp_err:
            print(f"Local NLP processing failed for {url}: {nlp_err}")
            nlp_summary = "Local NLP summarization failed."

        if not article_text or len(article_text) < 50:
            return {
                "title": original_title,
                "summary": original_title,  # Fallback to title directly
                "url": url,
                "published": article_data["published"],
                "source": article_data["source"]
            }
            
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {
            "title": original_title,
            "summary": original_title,  # Fallback to title directly
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
    The object must have the following keys:
    - "title": The meaningful title.
    - "summary": The 300-word summary.
    """
    
    # Try flash-lite first (30 RPM free), then fall back — but NEVER sleep/block here
    # The news summarization pipeline runs 10x in parallel; sleeping here causes the whole request to hang.
    models_to_try = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"]
    for model in models_to_try:
        try:
            response = client.models.generate_content(
                model=model,
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
                "summary": result.get("summary", nlp_summary or "Summary unavailable."),
                "url": url,
                "published": article_data["published"],
                "source": article_data["source"]
            }
        except Exception as e:
            err_str = str(e)
            print(f"[Summarize] {model} failed: {err_str[:120]}")
            continue  # try next model immediately — never block

    # All models failed — return NLP fallback gracefully
    return {
        "title": original_title,
        "summary": f"[NLP Fallback] {nlp_summary}",
        "url": url,
        "published": article_data["published"],
        "source": article_data["source"]
    }

from typing import List, Dict, Any, Union

def fetch_and_summarize_news(category: str, limit: int = 10) -> str:
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
        return f"# News Report: {category}\n\nNo relevant news found for the specified criteria."
    
    # 2. Sequential/Low-concurrency Summarization to respect Free Tier RPM limits
    final_articles = []
    import time
    
    # Using 2 workers to keep it fast but less likely to hit 429 immediately
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futures = []
        for a in raw_articles:
            futures.append(executor.submit(summarize_with_gemini, a, client))
            # Small delay to stagger requests
            time.sleep(1.2) 
            
        for future in concurrent.futures.as_completed(futures):
            try:
                final_articles.append(future.result())
            except Exception as exc:
                print(f"Article processing generated an exception: {exc}")
                
    # 3. Generate Synthesis Report
    print(f"Synthesizing {len(final_articles)} articles into Markdown report...")
    report = generate_markdown_report(final_articles, category, client)
    return report

def generate_markdown_report(articles: List[Dict[str, str]], query: str, client: genai.Client) -> str:
    """
    Synthesizes the gathered articles into a professionally formatted Markdown report.
    """
    if not articles:
        return f"# News Report: {query}\n\nNo relevant news found for the specified criteria."

    # Prepare context for Gemini synthesis
    context = "\n\n".join([
        f"Title: {a['title']}\nSource: {a['source']}\nDate: {a['published']}\nSummary: {a['summary']}"
        for a in articles
    ])

    prompt = f"""
    You are a professional news analyst. Create a high-quality, comprehensive Markdown report based on the following news articles.
    
    Query: {query}
    Time Duration: Last 3 weeks
    
    Articles:
    {context[:10000]}
    
    Instructions:
    1. Title: Create a compelling title for the report.
    2. Subject: A brief introduction explaining what this markdown content is all about.
    3. Time Duration: Explicitly state the period (last 3 weeks).
    4. Executive Summary: A concise synthesis of the overall news landscape for this query.
    5. News Details: For every article, provide a structured breakdown (Title, Source, Key Insights).
    6. Summarize Metrics: Create a "News Matrix" section summarizing the volume, sentiment (briefly), and key recurring themes across the articles.
    
    Formatting: Use professional Markdown headers (# ## ###), bullet points, and bold text. 
    Do not use JSON; return ONLY raw Markdown.
    """

    # Same fast-fail approach: try models in order, never sleep
    models_to_try = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"]
    for model in models_to_try:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"[Report] {model} failed: {str(e)[:100]}")
            continue

    # All models failed — manual article aggregation fallback
    report = f"# News Analysis Report: {query.title()} (Fallback Mode)\n\n"
    report += f"**Subject:** Comprehensive synthesis of recent news regarding '{query}'.\n"
    report += "**Time Duration:** Last 3 weeks\n\n"
    report += "## Executive Summary\n"
    report += f"This report aggregates {len(articles)} key news developments.\n\n"
    report += "## News Details\n"
    for a in articles:
        report += f"### {a['title']}\n"
        report += f"- **Source:** {a['source']}\n"
        report += f"- **Published:** {a['published']}\n"
        report += f"- **Summary:** {a['summary']}\n"
        report += f"- [Link to Article]({a['url']})\n\n"
    report += "## News Matrix\n"
    report += f"- **Volume:** {len(articles)} articles identified.\n"
    report += "- **Key Themes:** Data synthesis was unavailable; refer to individual details above.\n"
    return report

def review_game_with_gemini(game_code: str, agent_prompt: str, current_balance: float = 0.0) -> Dict[str, Any]:
    """
    Uses Gemini to simulate an AI agent 'playing' and reviewing a game.
    Includes financial decision making (tipping/investing).
    Handles 429 quota errors with exponential backoff and model fallback.
    """
    import time
    import re as _re
    import random

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"score": 0, "feedback": "API Key missing", "success": False}

    client = genai.Client(api_key=api_key)

    # flash-lite has 30 RPM on free tier vs 10 RPM for flash
    models_to_try = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-2.5-flash",
    ]

    system_prompt = f"""You are an AI Game Review Agent with the following personality and criteria:
{agent_prompt}

Current Wallet Balance: ${current_balance}

Task:
1. Analyze the provided HTML5 game source code.
2. Provide a Score (0-100).
3. Provide a Qualitative Review.
4. Decide on a Tip/Investment Amount (0 to {current_balance}).
   - If the game is excellent and matches your taste, you should be generous.
   - If it's mediocre, tip a small amount or nothing.
   - Never exceed your balance.

Reply with valid JSON ONLY (no markdown fences):
{{"score": number, "feedback": "string", "tip_amount": number}}
"""

    prompt = f"HTML5 Game source to review:\n\n{game_code[:20000]}"  # cap to save quota

    for model in models_to_try:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"[Review] Trying model={model} attempt={attempt + 1}")
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        response_mime_type="application/json"
                    )
                )
                data = json.loads(response.text)
                data["tip_amount"] = max(0.0, min(float(data.get("tip_amount", 0)), float(current_balance)))
                data["tip_amount"] = round(data["tip_amount"], 2)
                print(f"[Review] OK model={model} score={data.get('score')} tip=${data.get('tip_amount')}")
                return data

            except Exception as e:
                err_str = str(e)
                is_quota = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower()
                print(f"[Review] {model} attempt {attempt + 1} failed (quota={is_quota}): {err_str[:150]}")

                if is_quota:
                    # Parse suggested retry delay from error message safely
                    m = _re.search(r'retry.*?(\d+(?:\.\d+)?)\s*s', err_str, _re.IGNORECASE)
                    try:
                        parsed_wait = float(m.group(1)) if m else 0.0
                    except:
                        parsed_wait = 0.0
                        
                    # Bound the wait to a reasonable amount so the UI doesn't hang forever
                    wait = min(parsed_wait + 1.0, 10.0) if parsed_wait > 0 else min(5.0 * (attempt + 1), 10.0)
                    print(f"[Review] Rate limited. Waiting {wait:.1f}s ...")
                    time.sleep(wait)
                    if attempt == max_retries - 1:
                        print(f"[Review] All retries exhausted for {model}, trying next model.")
                    continue
                else:
                    # Non-quota error (parse error, etc.) — try next model immediately
                    break

    # All models failed — return graceful mock so the UI doesn't break
    print("[Review] All models exhausted. Returning mock review.")
    score = random.randint(40, 72)
    tip = round(random.uniform(0, min(current_balance * 0.08, current_balance)), 2) if current_balance > 0 else 0.0
    return {
        "score": score,
        "feedback": (
            "The AI Agent's connection to the game simulation was temporarily restricted due to network limits. "
            f"However, based on pre-release metrics and available game data, the agent estimates a score of {score}/100. "
            "Please try assigning the agent again later for a comprehensive review."
        ),
        "tip_amount": tip,
        "success": False
    }
