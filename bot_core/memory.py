"""
Memory module for AGI bot core.
Implements ShortTermMemory, LongTermMemory, and EpisodicMemory classes.
"""

class ShortTermMemory:
    """Stores recent events, observations, and chat context."""
    def __init__(self, capacity=20):
        self.capacity = capacity
        self.buffer = []
    def add(self, item):
        self.buffer.append(item)
        if len(self.buffer) > self.capacity:
            self.buffer.pop(0)
    def get(self):
        return list(self.buffer)

class LongTermMemory:
    """Stores facts, skills, and knowledge (can be backed by a DB or file)."""
    def __init__(self):
        self.knowledge = []
    def add(self, fact):
        self.knowledge.append(fact)
    def search(self, query):
        # Placeholder: implement vector search or keyword search
        return [k for k in self.knowledge if query.lower() in str(k).lower()]

class EpisodicMemory:
    """Stores sequences of events/episodes with timestamps."""
    def __init__(self):
        self.episodes = []
    def add(self, episode):
        self.episodes.append(episode)
    def get_recent(self, n=5):
        return self.episodes[-n:] if len(self.episodes) >= n else self.episodes
