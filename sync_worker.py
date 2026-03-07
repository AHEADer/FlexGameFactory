import subprocess
import time
import os

def sync():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        # 1. Add and commit any new intel reports or local changes under junda_games
        subprocess.run(["git", "add", "junda_games/"], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Only commit if there are STAGED changes in junda_games
        status = subprocess.run(["git", "status", "--porcelain", "junda_games/"], cwd=root_dir, capture_output=True, text=True)
        # We need to make sure we only commit if there are staged changes (starts with M, A, D, R, C, etc, but not ??)
        has_staged = any(line[0] != ' ' and line[0] != '?' for line in status.stdout.splitlines() if line.strip())
        if has_staged:
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
