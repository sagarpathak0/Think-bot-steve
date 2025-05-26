# SteveRLBot (Think-Bot)

SteveRLBot is a modular, voice-activated AI assistant and reinforcement learning (RL) agent. It combines computer vision, conversational AI, memory, multilingual support, and a DQN-based RL agent in a grid world. The codebase is organized for easy extension and maintenance.

## Features

- **Computer Vision**: Face detection, object detection (YOLOv5), and OCR (Tesseract) via webcam.
- **Conversational AI**: Uses Gemini AI for context-aware responses.
- **Speech Recognition**: Wake word detection ("Steve") and command recognition.
- **Text-to-Speech (TTS)**: Natural-sounding speech with Coqui TTS (fallback: pyttsx3).
- **Memory**: Remembers conversation history and observations, persistent across restarts.
- **Personality & Skills**: Tells jokes, gives time/weather, remembers preferences.
- **Multilingual**: Detects and translates languages (Google Translate API).
- **Logging & Analytics**: Logs all conversations and observations.
- **Reinforcement Learning**: DQN agent learns to navigate a grid world with obstacles and goals.
- **Modular Codebase**: Organized into modules for TTS, memory, vision, speech, skills, logging, RL, and more.

## How to Interact
- Say "Steve" to wake the bot, then give your command.
- Ask questions, request observations, or say `recall <something>` to retrieve past info.
- Steve responds in both text and speech.

## Setup Instructions

See `setup_commands.txt` for a step-by-step guide. Typical setup:

```powershell
# 1. (Optional) Create and activate a virtual environment
python -m venv myenv
.\myenv\Scripts\Activate.ps1

# 2. Upgrade pip
pip install --upgrade pip

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the main bot
python main.py

# 5. Run the RL agent (DQN grid world)
python -m RL.main_loop
```

## Project Structure

```
main.py                  # Main entry point for Steve bot
RL/                      # Modular RL package (DQN agent, env, etc.)
requirements.txt         # Python dependencies
setup_commands.txt       # All setup and run commands
what_can_steve_do.txt    # Feature overview and usage
```

## RL Agent Details
- DQN agent learns to reach green goal squares and avoid black obstacles in a grid world.
- Rewards: +10 (goal), -5 (obstacle), -0.1 (empty), +2 (new object), -1 (revisit object)
- Hyperparameters: learning rate 1e-4, batch size 64, replay buffer 5000, epsilon decay 0.999
- Run with: `python -m RL.main_loop`

## Notes
- All commands should be run from the project root: `c:\Users\sagar\OneDrive\desktop\MINI PROJECT`
- For more details, see `what_can_steve_do.txt` and `setup_commands.txt`.

---
This README is up to date as of May 26, 2025.
