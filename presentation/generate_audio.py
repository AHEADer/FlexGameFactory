#!/usr/bin/env python3
import os
import subprocess

AUDIO_DIR = "/Users/kyrieb/hackathon/FlexGameFactory/presentation/audio"
VOICE = "Samantha"
RATE = 180

# The Script segments mapped to the 6 slides
segments = [
    {
        "name": "slide1",
        "text": "Hey judges, are you headache about the news from every where? We consume news every day, but it’s a passive experience. We read headlines, feel the weight of the world, and then... we just scroll past. But what if we could engage with the news instead of just reading it?"
    },
    {
        "name": "slide2",
        "text": "Introducing NewsPlay. Built for the Google Gemini Hackathon, our system uses Gemini’s advanced reasoning to harvest live news and transform it into interactive game mechanics. Step 1, we search the news we like or just random choose the news predefined in the UI. I am afraid to be replaced by AI, so I go search the related keyword. After searching, system fetching latest news from specific 20 famous news domains. Gemini will help to summarize and generate a markdown file to be the source for game creation. Step 2, we run a cron job to fetch the news summary from the storage(our github). Cron job will trigger the game generation via Gemini-cli. Game generation leverage the skills we prepared, call tools like NanoBanana and Lyria(TBD) to generate the media resources as well. Once game is generate, the UI will fetch the new games to the game factory. In step 3, we shows that the game we generated related to the news. Pretty fun game generated, I almost forgot I may be replaced by AI."
    },
    {
        "name": "slide3",
        "text": "We use the Gemini model as the main power to summarize all the content and as our main driver for generation. Then, we leverage Gemini-CLI to run time-heavy background jobs efficiently. To make our games fancy and joyful, we harness the power of NanoBanana and Lyria to generate stunning pictures and audio. And of course, this entire project is implemented by Antigravity."
    },
    {
        "name": "slide4",
        "text": "Within sometime, it generates a full game logic schema. Whether it’s a political strategy sim or a sci-fi adventure based on the latest discoveries, the news IS the level design."
    },
    {
        "name": "slide5",
        "text": "Our current pipeline takes you from headline to playable prototype seamlessly. We’ve bridged the gap between information and interaction, turning staying informed into an addictive, educational, and fun experience."
    },
    {
        "name": "slide6",
        "text": "We are Team NewsPlay, and we’re turning the world’s headlines into the world’s playground. Thanks for watching!"
    }
]

def generate_audio():
    if not os.path.exists(AUDIO_DIR):
        os.makedirs(AUDIO_DIR)
        
    for segment in segments:
        name = segment["name"]
        text = segment["text"]
        aiff_path = os.path.join(AUDIO_DIR, f"{name}.aiff")
        m4a_path = os.path.join(AUDIO_DIR, f"{name}.m4a")
        
        print(f"Generating audio for {name}...")
        
        # 1. Generate AIFF using 'say'
        subprocess.run(["say", "-v", VOICE, "-r", str(RATE), text, "-o", aiff_path], check=True)
        
        # 2. Convert to M4A (AAC) using 'afconvert'
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", aiff_path, m4a_path], check=True)
        
        # 3. Remove the AIFF
        os.remove(aiff_path)
        
        print(f"Saved: {m4a_path}")

if __name__ == "__main__":
    generate_audio()
