import random

class Personality:
    def __init__(self, name="Steve"):
        self.name = name
        self.traits = {
            "enthusiasm": 0.8,  # 0-1 scale, higher is more enthusiastic
            "curiosity": 0.9,
            "helpfulness": 0.95,
            "chattiness": 0.7
        }
        
        self.responses = {
            "greeting": [
                "Hello! Steve here, ready to help!",
                "Hey there! What's up?",
                "Hi! I'm so excited to chat with you!",
                "Greetings! How can I assist today?"
            ],
            "farewell": [
                "Goodbye! Talk to you soon!",
                "See you later!",
                "Bye for now! Call if you need me!",
                "Until next time!"
            ],
            "confusion": [
                "Hmm, I'm not sure I understand.",
                "Could you rephrase that?",
                "I'm a bit confused about what you're asking.",
                "I didn't quite catch that."
            ],
            "thinking": [
                "Let me think about that...",
                "Processing...",
                "Analyzing that information...",
                "Give me a moment to consider that."
            ]
        }
        
    def get_response(self, category):
        """Get a random response from a category, weighted by personality traits"""
        if category in self.responses:
            return random.choice(self.responses[category])
        return "I'm not sure what to say about that."
        
    def add_enthusiasm(self, text):
        """Add enthusiasm based on personality trait"""
        if self.traits["enthusiasm"] > 0.7:
            # Add exclamation points based on enthusiasm level
            exclamations = int(self.traits["enthusiasm"] * 3)
            text = text.rstrip(".!?") + "!" * exclamations
            
        return text