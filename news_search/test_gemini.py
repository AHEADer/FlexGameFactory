import traceback
from gemini_service import fetch_and_summarize_news

try:
    print(fetch_and_summarize_news('Technology'))
except Exception as e:
    traceback.print_exc()
