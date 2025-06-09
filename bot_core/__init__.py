# This file makes the folder a Python package
# Expose key components for easier importing
from .vision import WebcamStream, VisionSystem
from .sensors import distance_data, start_ultrasonic_server, PIRSensor
# from .audio import SpeechEngine
from .control import DecisionEngine, Memory
from .ai import GeminiClient
from .language import LanguageProcessor
from .personality import Personality
from .skills import Skills

__all__ = [
    'WebcamStream',
    'VisionSystem',
    'distance_data', 
    'start_ultrasonic_server',
    'PIRSensor',
    # 'SpeechEngine',
    'DecisionEngine',
    'Memory',
    'GeminiClient',
    'LanguageProcessor',
    'Personality',
    'Skills'
]