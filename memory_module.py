"""
Persistent and semantic memory for Think-Bot
"""
import os
import json
MEMORY_FILE = "steve_memory.json"

conversation_history = []
recent_observations = []
MAX_OBSERVATIONS = 5

def load_memory():
    global conversation_history, recent_observations
    if os.path.exists(MEMORY_FILE):
        try:
            with open(MEMORY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                conversation_history = data.get("conversation_history", [])
                recent_observations = data.get("recent_observations", [])
        except Exception as e:
            print(f"[WARN] Could not load memory: {e}")
    else:
        conversation_history = []
        recent_observations = []

def save_memory():
    try:
        with open(MEMORY_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "conversation_history": conversation_history,
                "recent_observations": recent_observations
            }, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[WARN] Could not save memory: {e}")

def search_memory(query):
    results = []
    q = query.lower()
    for turn in conversation_history:
        if q in turn.get("content", "").lower():
            results.append(f"{turn['role'].capitalize()}: {turn['content']}")
    for obs in recent_observations:
        if q in obs.lower():
            results.append(f"Observation: {obs}")
    return results
