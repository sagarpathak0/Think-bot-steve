import sys
import os
import time
import threading

# Add the parent directory to path so we can import other modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vision import WebcamStream
from sensors.ultrasonic import distance_data
from audio.speak import SpeechEngine
from .memory import Memory
from personality.traits import Personality
from language.translator import LanguageProcessor
from skills.basic_skills import Skills
from ai.gemini_client import GeminiClient

class DecisionEngine:
    def set_webcam_stream(self, webcam_stream):
        """Attach a WebcamStream instance for vision polling"""
        self.webcam_stream = webcam_stream
        self.last_seen_objects = set()
        self.last_asked_objects = set()

    def poll_vision(self):
        """Poll the webcam for new object/person detections and act curiously, and update summary after vision chat"""
        if not hasattr(self, 'webcam_stream') or not self.webcam_stream.is_running:
            return
        ret, _, detected_labels = self.webcam_stream.read_frame()
        if not ret or not detected_labels:
            return
        # Only consider unique objects in this frame
        current_objects = set(detected_labels)
        new_objects = current_objects - self.last_seen_objects
        for obj in new_objects:
            # Remember the object
            self.memory.remember_object(obj)
            # Only ask about truly new objects (not already asked in this session)
            if obj not in self.last_asked_objects:
                question = f"I see a {obj}! Can you tell me more about it?"
                # Add to conversation and memory
                self.memory.add_conversation("bot", question)
                self.memory.save_memory()
                # Use Gemini to generate a curious follow-up (optional, can just use question)
                context = self.memory.memory.get("summary", "")
                ai_response = self.ai.ask(question, context)
                ai_response = self.personality.add_enthusiasm(ai_response)
                self.memory.add_conversation("bot", ai_response)
                self.memory.save_memory()
                self.speech.speak(ai_response)
                self.last_asked_objects.add(obj)
                # Update the running summary after vision chat
                self.memory.update_summary(self.ai)
        self.last_seen_objects = current_objects
    def __init__(self):
        self.speech = SpeechEngine()
        self.memory = Memory("bot_memory.json")
        self.personality = Personality()
        self.language = LanguageProcessor()
        self.skills = Skills()
        self.ai = GeminiClient()
        
        self.last_distance = None
        self.is_running = True
        
    def process_sensor_data(self):
        """Process incoming sensor data and make decisions"""
        # Get current ultrasonic sensor distance
        current_distance = distance_data.get("distance")
        
        # Check if distance changed significantly
        if current_distance is not None and self.last_distance is not None:
            if current_distance < 30 and self.last_distance >= 30:
                message = f"Object detected at {current_distance} centimeters."
                self.speech.speak(message)
                self.memory.add_conversation("bot", message)
                self.memory.save_memory()  # Save after adding to memory
            elif current_distance > 100 and self.last_distance <= 100:
                message = "Path is clear."
                self.speech.speak(message)
                self.memory.add_conversation("bot", message)
                self.memory.save_memory()  # Save after adding to memory
                
        self.last_distance = current_distance
        
    def process_user_input(self, text_input):
        """Process user text input"""
        # Force English as the input and output language
        source_lang = "en"
        target_lang = "en"
        
        # Save original input to memory
        self.memory.add_conversation("user", text_input)
        
        # Look for skill triggers
        if "tell me a joke" in text_input.lower():
            response = self.skills.tell_joke()
        elif "what time is it" in text_input.lower():
            response = self.skills.get_time()
        elif "what day is" in text_input.lower() or "what is the date" in text_input.lower():
            response = self.skills.get_date()
        else:
            # Get recent memory for context
            recent = self.memory.get_recent_conversations(5)
            context = "\n".join([f"{c['speaker']}: {c['message']}" for c in recent])
            
            # Add a prompt that forces English response
            context = "IMPORTANT: Always respond in English only.\n\n" + context
            
            # Ask Gemini
            response = self.ai.ask(text_input, context)

        # Add personality
        response = self.personality.add_enthusiasm(response)
        
        # Save response to memory
        self.memory.add_conversation("bot", response)
        self.memory.save_memory()  # Save after conversation is complete
        # Update the summary after each chat
        self.memory.update_summary(self.ai)
        self.speech.speak(response)
        return response
            
    def run(self):
        """Main run loop for the decision engine"""
        while self.is_running:
            self.process_sensor_data()
            # Poll vision for new objects/persons
            if hasattr(self, 'webcam_stream'):
                self.poll_vision()
            time.sleep(0.5)
            
    def stop(self):
        """Stop the decision engine"""
        self.is_running = False

# Test the decision engine
if __name__ == "__main__":
    engine = DecisionEngine()
    engine.run()
