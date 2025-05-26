"""
Extra skills and commands for Steve (Think-Bot)
"""
import datetime
import random
import requests

def tell_joke():
    jokes = [
        "Why did the computer show up at work late? It had a hard drive!",
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "Why did the robot go on vacation? To recharge its batteries!"
    ]
    return random.choice(jokes)

def get_time():
    return f"The current time is {datetime.datetime.now().strftime('%H:%M:%S')}"

def get_weather(city="Delhi"):
    # Dummy implementation, replace with real API if you want
    return f"Sorry, I can't fetch real weather yet. But I hope it's nice in {city}!"
