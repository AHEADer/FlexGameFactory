import traceback
from gemini_service import fetch_and_summarize_news
import sys

print("Fetching news...")
try:
    articles = fetch_and_summarize_news("Business", limit=5)
    for a in articles:
        print(a["title"], "| Summary:", a["summary"][:50])
except Exception as e:
    traceback.print_exc()
