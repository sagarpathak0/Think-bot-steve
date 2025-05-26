"""
Logging and analytics for Steve (Think-Bot)
"""
import datetime
LOG_FILE = "steve_log.txt"

def log_event(event):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.datetime.now().isoformat()}] {event}\n")
