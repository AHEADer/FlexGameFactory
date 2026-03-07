import subprocess
import time
import os

def sync():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        # 1. Add and commit any new intel reports or local changes under junda_games, ignoring logs
        subprocess.run(["git", "add", "junda_games/", ":!*.log"], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Only commit if there are changes in junda_games
        status = subprocess.run(["git", "status", "--porcelain", "junda_games/"], cwd=root_dir, capture_output=True, text=True)
        if status.stdout.strip():
            subprocess.run(["git", "commit", "-m", "auto: sync games"], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # 2. Pull latest from cloud
        subprocess.run(["git", "pull", "--rebase", "origin", "main"], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # 3. Push local changes to cloud
        subprocess.run(["git", "push", "origin", "main"], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
    except Exception as e:
        # print(f"Sync error: {e}") # Keep it silent as requested
        pass

if __name__ == "__main__":
    print("Background Sync: Running every 10s...")
    while True:
        sync()
        time.sleep(10)
