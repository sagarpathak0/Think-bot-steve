import threading
import asyncio
import edge_tts
import tempfile
import os
import pygame

class SpeechEngine:
    def __init__(self, voice="en-US-JennyNeural"):
        self.voice = voice
        # Initialize pygame mixer
        pygame.mixer.init()
        pygame.mixer.quit()  # Quit immediately to avoid resource conflicts
        
    def _play_mp3(self, path):
        """Play an MP3 file using pygame"""
        pygame.mixer.init()
        pygame.mixer.music.load(path)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)
        pygame.mixer.quit()
        
    async def _generate_speech(self, text):
        """Generate speech using Edge TTS"""
        communicate = edge_tts.Communicate(text, voice=self.voice)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
            temp_path = f.name
        
        self._play_mp3(temp_path)
        os.remove(temp_path)
        
    def speak(self, text):
        """Speak text using Edge TTS"""
        asyncio.run(self._generate_speech(text))
        
    def speak_async(self, text):
        """Speak text in a separate thread (non-blocking)"""
        threading.Thread(target=self.speak, args=(text,), daemon=True).start()

# Example usage
if __name__ == "__main__":
    speech = SpeechEngine()
    speech.speak("Testing the speech module.")
