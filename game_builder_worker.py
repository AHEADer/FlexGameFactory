import os
import subprocess
import time
import logging
import threading
from concurrent.futures import ThreadPoolExecutor

from sync_worker import sync

# Configure logging — write to file AND stream to console
_log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
_file_handler = logging.FileHandler('gemini_builder.log')
_file_handler.setFormatter(_log_formatter)
_console_handler = logging.StreamHandler()
_console_handler.setFormatter(_log_formatter)

logging.basicConfig(level=logging.INFO, handlers=[_file_handler, _console_handler])

# Global lock for git operations to avoid conflicts
git_lock = threading.Lock()

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
                    
def git_commit_and_push(game_dir_name):
    with git_lock:
        root_dir = os.path.dirname(os.path.abspath(__file__))
        try:
            logging.info(f"[{game_dir_name}] Locking git for commit/push.")
            # Add changes
            subprocess.run(["git", "add", "."], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
            # Commit changes
            status = subprocess.run(["git", "status", "--porcelain"], cwd=root_dir, capture_output=True, text=True)
            if status.stdout.strip():
                commit_msg = f"auto: game generated for {game_dir_name}"
                subprocess.run(["git", "commit", "-m", commit_msg], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
            # Pull rebase and push
            subprocess.run(["git", "pull", "--rebase", "origin", "main"], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.run(["git", "push", "origin", "main"], cwd=root_dir, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            logging.info(f"[{game_dir_name}] Successfully committed and pushed.")
        except Exception as e:
            logging.error(f"[{game_dir_name}] Error during git operations: {e}")

def process_game_dir(game_dir_name):
    root_dir = os.path.dirname(os.path.abspath(__file__))
    junda_games_dir = os.path.join(root_dir, 'junda_games')
    full_dir_path = os.path.join(junda_games_dir, game_dir_name)
    report_path = os.path.join(full_dir_path, 'report.md')
    
    logging.info(f"[{game_dir_name}] Starting game generation.")
    
    # Run gemini CLI
    prompt = f"Use @[junda/generate_news_based_game/SKILL.md] to generate a game, theme can be found in news @[{report_path}]. Game files should be saved in the junda_games/{game_dir_name} dir."
    
    cmd = [
        "gemini", "-p", prompt, "-y", "-m", "gemini-3.1-flash-lite-preview"
    ]
    
    try:
        # Stream output line-by-line so logs appear in real time
        process = subprocess.Popen(
            cmd, cwd=root_dir,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, bufsize=1
        )
        for line in process.stdout:
            line = line.rstrip()
            if line:
                logging.info(f"[{game_dir_name}] {line}")
        process.wait()

        if process.returncode == 0:
            logging.info(f"[{game_dir_name}] successfully generated game.")
            # Git add and push right after generating
            git_commit_and_push(game_dir_name)
        else:
            logging.error(f"[{game_dir_name}] failed to generate game. Exit code: {process.returncode}")
    except Exception as e:
        logging.error(f"[{game_dir_name}] Exception during subprocess execution: {e}")

def get_pending_directories():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    junda_games_dir = os.path.join(root_dir, 'junda_games')
    
    if not os.path.exists(junda_games_dir):
        return []
        
    pending = []
    for item in os.listdir(junda_games_dir):
        dir_path = os.path.join(junda_games_dir, item)
        if os.path.isdir(dir_path):
            report_path = os.path.join(dir_path, 'report.md')
            if os.path.exists(report_path):
                # Check for html files
                has_html = any(f.endswith('.html') for f in os.listdir(dir_path))
                if not has_html:
                    pending.append(item)
    return pending

def main():
    load_env()
    logging.info("Starting Auto Game Builder Worker...")
    
    while True:
        try:
            # 1. Sync latest from remote
            sync()
            
            # 2. Check for pending directories
            pending_dirs = get_pending_directories()
            
            if pending_dirs:
                logging.info(f"Found {len(pending_dirs)} pending directories: {', '.join(pending_dirs)}")
                
                # 3. Spawn processes to run in parallel using ThreadPoolExecutor
                with ThreadPoolExecutor(max_workers=min(4, len(pending_dirs))) as executor:
                    for d in pending_dirs:
                        executor.submit(process_game_dir, d)
                
                logging.info("Finished processing batch.")
            
        except Exception as e:
            logging.error(f"Error in main loop: {e}")
            
        # Sleep before next check
        time.sleep(10)

if __name__ == "__main__":
    main()
