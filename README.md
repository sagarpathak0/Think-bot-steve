# SteveRLBot (Think-Bot)

SteveRLBot is a modular, voice-activated AI assistant and reinforcement learning (RL) agent. It combines computer vision, conversational AI, memory, multilingual support, and a DQN-based RL agent in a grid world. The codebase is organized for easy extension and maintenance.

## Features

- **Computer Vision**: Face detection, object detection (YOLOv5), and OCR (Tesseract) via webcam.
- **Conversational AI**: Uses Gemini AI for context-aware responses.
- **Speech Recognition**: Wake word detection ("Steve") and command recognition.
- **Text-to-Speech (TTS)**: Natural-sounding speech with Edge TTS and pygame audio playback.
- **Memory**: Remembers conversation history and observations, persistent across restarts.
- **Personality & Skills**: Tells jokes, gives time/weather, remembers preferences.
- **Multilingual**: Detects and translates languages.
- **Hardware Integration**: ESP8266 with ultrasonic sensor for obstacle detection.
- **Reinforcement Learning**: DQN agent learns to navigate a grid world with obstacles and goals.

## Memory System Details

- All conversations and object memories are stored in `bot_memory.json`.
- Example structure:
  - `conversation_history`: List of all user and bot messages with timestamps
  - `object_memory`: Dictionary of objects and their descriptions
  - `last_seen`: Last seen timestamp for each object
- Memory is updated automatically after every conversation or object event.
- You can recall objects or search memory using text commands.

## Architecture

The project uses a modular architecture with the following components:

- `bot_core/`: Main package containing all modular components
  - `vision/`: Camera and image processing
    - `webcam_stream.py`: Handles webcam input with buffering controls
    - `vision_system.py`: YOLOv5 object detection integration
  - `audio/`: Text-to-speech capabilities
    - `speak.py`: Edge TTS integration with pygame audio playback
  - `sensors/`: Hardware sensor integration
    - `ultrasonic.py`: ESP8266 ultrasonic sensor Flask server
    - `pir.py`: Motion detection sensor interface
  - `control/`: Decision engine and memory management
    - `decision_engine.py`: Main bot logic and decision making
    - `memory.py`: Persistent memory system with search/recall
  - `ai/`: AI model integration
    - `gemini_client.py`: Google Gemini API integration with fallback
  - `language/`: Multilingual capabilities
    - `translator.py`: Language detection and translation
  - `personality/`: Personality traits and response style
    - `traits.py`: Customizable personality parameters
  - `skills/`: Built-in skills and abilities
    - `basic_skills.py`: Jokes, time, weather, and other utilities
- `RL/`: Reinforcement learning package
  - `agent.py`: DQN agent implementation
  - `env.py`: Grid world environment
  - `dqn.py`: Deep Q-Network model
  - `replay_buffer.py`: Experience replay buffer
  - `main_loop.py`: Entry point for RL simulation

## Requirements

- Python 3.11+
- OpenCV
- PyGame
- Flask
- Google Generative AI package
- PyTorch (for vision capabilities)
- python-dotenv

## Quick Start

1. Create a `.env` file with your Gemini API key
2. Set up hardware components (webcam, ultrasonic sensor)
3. Run `python -m bot_core.main` for the main assistant
4. Run `python -m RL.main_loop` for the RL agent

## How to Interact
- Type commands at the prompt and press Enter
- Special commands:
  - `tell me a joke` - Steve will tell you a joke
  - `what time is it` - Steve will tell you the current time
  - `distance` - Check the current distance from the ultrasonic sensor
  - `quit` - Exit the program

## Notes
- All commands should be run from the project root
- See `setup_commands.txt` for a full list of setup instructions

---
This README is up to date as of June 1, 2025.
