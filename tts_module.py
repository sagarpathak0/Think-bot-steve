

import threading
import asyncio
import edge_tts
import tempfile
import os

import pygame


def play_mp3_pygame(path):
    pygame.mixer.init()
    pygame.mixer.music.load(path)
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)
    pygame.mixer.quit()

def speak_edge(text, voice="en-US-JennyNeural"):
    async def _speak():
        communicate = edge_tts.Communicate(text, voice=voice)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
            temp_path = f.name
        play_mp3_pygame(temp_path)
        os.remove(temp_path)
    asyncio.run(_speak())

def speak_fast(text):
    threading.Thread(target=speak_edge, args=(text,), daemon=True).start()
