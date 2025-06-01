import requests
import random
import datetime

class Skills:
    def __init__(self):
        self.jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "What did the ocean say to the beach? Nothing, it just waved.",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "I told my wife she was drawing her eyebrows too high. She looked surprised.",
            "What do you call a fake noodle? An impasta!"
        ]
        
    def tell_joke(self):
        """Return a random joke"""
        return random.choice(self.jokes)
        
    def get_time(self):
        """Get current time"""
        now = datetime.datetime.now()
        return f"The current time is {now.strftime('%H:%M:%S')}"
        
    def get_date(self):
        """Get current date"""
        now = datetime.datetime.now()
        return f"Today is {now.strftime('%A, %B %d, %Y')}"
        
    def get_weather(self, city="New York"):
        """Get weather for a city (would require API key in real implementation)"""
        return f"Weather functionality requires API integration. This would show weather for {city}."