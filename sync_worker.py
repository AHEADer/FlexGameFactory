import subprocess
import time
import os

def sync():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        # 1. Add and commit any new intel reports or local changes
        subprocess.run(["git", "add", "."], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Only commit if there are changes
        status = subprocess.run(["git", "status", "--porcelain"], cwd=root_dir, capture_output=True, text=True)
        if status.stdout.strip():
            subprocess.run(["git", "commit", "-m", "auto: sync intel reports and local games"], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
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
