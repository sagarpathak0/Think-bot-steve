import json
from datetime import datetime

class Memory:
    def __init__(self, filename="bot_memory.json"):
        self.filename = filename
        self.memory = self.load_memory()
        if "summary" not in self.memory:
            self.memory["summary"] = ""

    def load_memory(self):
        """Load memory from file"""
        try:
            with open(self.filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {
                "conversation_history": [],
                "object_memory": {},
                "last_seen": {}
            }
            
    def save_memory(self):
        """Save memory to file"""
        with open(self.filename, 'w', encoding='utf-8') as f:
            json.dump(self.memory, f, ensure_ascii=False, indent=2)
            
    def add_conversation(self, speaker, message):
        """Add a conversation entry"""
        self.memory["conversation_history"].append({
            "timestamp": datetime.now().isoformat(),
            "speaker": speaker,
            "message": message
        })
        self.save_memory()
        
    def remember_object(self, object_name, description=None):
        """Remember information about an object"""
        if object_name not in self.memory["object_memory"]:
            self.memory["object_memory"][object_name] = []
            
        entry = {
            "timestamp": datetime.now().isoformat(),
            "description": description
        }
        
        self.memory["object_memory"][object_name].append(entry)
        self.memory["last_seen"][object_name] = datetime.now().isoformat()
        self.save_memory()
        
    def recall_object(self, object_name):
        """Recall information about an object"""
        if object_name in self.memory["object_memory"]:
            return {
                "info": self.memory["object_memory"][object_name],
                "last_seen": self.memory["last_seen"].get(object_name)
            }
        return None
        
    def get_recent_conversations(self, count=5):
        """Get the most recent conversations"""
        return self.memory["conversation_history"][-count:] if self.memory["conversation_history"] else []
        
    def search_memory(self, query):
        """Search through memory for relevant information"""
        results = []
        
        # Search conversation history
        for conv in self.memory["conversation_history"]:
            if query.lower() in conv["message"].lower():
                results.append(conv)
                
        # Search object memory
        for obj, entries in self.memory["object_memory"].items():
            if query.lower() in obj.lower():
                results.append({
                    "object": obj,
                    "entries": entries
                })
                
        return results
    
    def update_summary(self, ai):
        """Update the running summary using Gemini"""
        # Use all conversation history for summarization
        history = self.memory["conversation_history"]
        if not history:
            return
        # Create a text block of the conversation
        convo_text = "\n".join([f"{c['speaker']}: {c['message']}" for c in history])
        prompt = (
            "Summarize the following conversation between a user and an AI assistant. "
            "Keep the summary concise but include all important facts, names, and context. "
            "This summary will be used as context for future conversations.\n\n"
            f"{convo_text}\n\nSummary:"
        )
        summary = ai.ask(prompt)
        self.memory["summary"] = summary
        self.save_memory()

# Example usage
if __name__ == "__main__":
    memory = Memory("bot_memory.json")
    
    # Add some test data
    memory.add_conversation("user", "Hello bot!")
    memory.add_conversation("bot", "Hello! How can I help?")
    
    memory.remember_object("cup", "A blue coffee cup on the desk")
    
    # Test recall
    print("\nRecent conversations:", memory.get_recent_conversations())
    print("\nCup memory:", memory.recall_object("cup"))
    print("\nSearch results for 'hello':", memory.search_memory("hello"))
