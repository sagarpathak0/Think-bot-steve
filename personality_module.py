"""
Personality and customization for Steve (Think-Bot)
"""
import json
import os

PROFILE_FILE = "steve_profile.json"

def load_profile():
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"name": None, "preferences": {}, "voice": "en-US-JennyNeural"}

def save_profile(profile):
    with open(PROFILE_FILE, "w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)

profile = load_profile()

def set_user_name(name):
    profile["name"] = name
    save_profile(profile)

def get_user_name():
    return profile.get("name")

def set_preference(key, value):
    profile["preferences"][key] = value
    save_profile(profile)

def get_preference(key):
    return profile["preferences"].get(key)

def set_voice(voice):
    profile["voice"] = voice
    save_profile(profile)

def get_voice():
    return profile.get("voice", "en-US-JennyNeural")
