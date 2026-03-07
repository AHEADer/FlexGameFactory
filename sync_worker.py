import subprocess
import time
import os

def sync():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    try:
        # Just run the pull silently
        subprocess.run(
            ["git", "pull", "--rebase", "origin", "main"],
            cwd=root_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except:
        pass

if __name__ == "__main__":
    print("Background Sync: Running every 10s...")
    while True:
        sync()
        time.sleep(10)
