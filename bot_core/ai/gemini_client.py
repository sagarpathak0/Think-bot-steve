import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiClient:
    def __init__(self, api_key=None):
        """Initialize Gemini client with an API key"""
        # Try to get API key from different sources
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        
        self._setup_client()
            
    def _setup_client(self):
        """Setup the Gemini client with current API key"""
        max_attempts = 3
        for attempt in range(max_attempts):
            try:
                if not self.api_key:
                    self.api_key = input("Enter your Gemini API key: ")
                    
                genai.configure(api_key=self.api_key)
                # Use gemini-1.5-flash instead of gemini-1.5-pro to avoid quota issues
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.chat = self.model.start_chat(history=[])
                
                # Test the connection with a simple query
                response = self.chat.send_message("Hello")
                if response.text:
                    print("✅ Gemini API connection successful")
                    return
                    
            except Exception as e:
                print(f"❌ API key error (attempt {attempt+1}/{max_attempts}): {e}")
                if "quota" in str(e).lower() or "rate limit" in str(e).lower():
                    print("You've hit API rate limits. Try using a different model or wait a while.")
                    if 'gemini-1.5-pro' in str(e):
                        print("Switching to gemini-1.5-flash model...")
                        try:
                            self.model = genai.GenerativeModel('gemini-1.5-flash')
                            self.chat = self.model.start_chat(history=[])
                            response = self.chat.send_message("Hello")
                            if response.text:
                                print("✅ Gemini API connection successful with flash model")
                                return
                        except Exception as e2:
                            print(f"Still having issues: {e2}")
                    
                self.api_key = None  # Reset for next attempt
                
        # If we get here, all attempts failed
        print("Could not establish connection to Gemini API after multiple attempts.")
        print("Bot will continue without Gemini AI support.")
            
    def ask(self, question, context=None, detected_objects=None):
        """Ask Gemini a question with optional context and detected objects. Only mention objects if actually detected."""
        # If no model (API key failed), return fallback response
        if not hasattr(self, 'model'):
            return "I'm sorry, I can't connect to my AI services right now."
        try:
            # Compose a system prompt that only allows object mentions if detected_objects is not empty
            if detected_objects and len(detected_objects) > 0:
                objects_str = ', '.join(detected_objects)
                vision_line = f"You currently see these objects: {objects_str}. You may ask about them."
            else:
                vision_line = "You do not see any objects right now. Do not mention seeing or detecting anything unless the user describes it."

            if context:
                prompt = (
                    "You are Steve, a friendly robot. "
                    + vision_line + " "
                    "Never say you can't see or that you are just a language model. "
                    "Respond in a short, friendly, conversational way (1-2 sentences, not a paragraph).\n"
                    f"Context: {context}\n"
                    f"Question: {question}\n"
                )
            else:
                prompt = (
                    "You are Steve, a friendly robot. "
                    + vision_line + " "
                    "Never say you can't see or that you are just a language model. "
                    "Respond in a short, friendly, conversational way (1-2 sentences, not a paragraph).\n"
                    f"Question: {question}\n"
                )
            response = self.chat.send_message(prompt)
            return response.text
        except Exception as e:
            return f"I'm sorry, I encountered an error: {str(e)}"
        
    def add_context(self, role, content):
        """Add a message to the chat history"""
        if hasattr(self, 'model') and hasattr(self, 'chat'):
            try:
                self.chat = self.model.start_chat(history=self.chat.history + [
                    {"role": role, "parts": [content]}
                ])
            except Exception:
                pass  # Silently fail if API is not working
    
    def process_user_input(self, text_input):
        """Process the user input and get a response from Gemini"""
        # Here, self.memory.memory is assumed to be a dict-like object
        summary = self.memory.memory.get("summary", "")
        context = f"Conversation summary so far: {summary}\n"
        # Add the new user input
        context += f"User: {text_input}\n"
        response = self.ask(text_input, context)
        
        # Optionally, update the memory with the new user input and response
        self.memory.memory["summary"] = summary + f"User: {text_input}\nAI: {response}\n"
        
        return response