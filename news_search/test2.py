from dotenv import load_dotenv; load_dotenv()
from google import genai
import os
import traceback

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

prompt = "Summarize: hello world"
try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
    )
    print("SUCCESS")
    print(response.text)
except Exception as e:
    print("FAILED")
    traceback.print_exc()
