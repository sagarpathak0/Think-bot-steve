# SteveRLBot (Think-Bot)

SteveRLBot is a modular, voice-activated AI assistant and reinforcement learning (RL) agent. It combines computer vision, conversational AI, memory, multilingual support, and a DQN-based RL agent in a grid world. The codebase is organized for easy extension and maintenance.

---

## Cyberpunk Theme

The dashboard and all web UI use a custom **cyberpunk/neon** theme with:

- Futuristic neon colors (blue, pink, purple, green)
- Glitch and HUD effects
- Pixel/monospace fonts
- Animated backgrounds and console-style layouts

For a visual preview, see the `frontend/src/styles/globals.css` and the dashboard page. (Add screenshots here if desired.)

---

## Features

- **Web Dashboard**: Modern, multi-section dashboard (Astra/console style) for stats, chat, device control, and more.
- **User Authentication**: Registration/login with email OTP, JWT-secured endpoints, and PostgreSQL user storage.
- **Device/Robot Control**: Control robot movement (forward, back, left, right, stop) from the dashboard or API.
- **Stats & Memory**: Per-user stats, mood, and conversation history, all stored in PostgreSQL.
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

---

## Environment Variables

All secrets and configuration are loaded from `.env` files. **Never commit secrets to git.**

### Backend (`.env` in project root)

```
PGDATABASE=thinkBot
PGUSER=avnadmin
PGPASSWORD=...           # Your PostgreSQL password
PGHOST=...               # Your PostgreSQL host
PGPORT=...               # Your PostgreSQL port
GEMINI_API_KEY=...       # Google Gemini API key
EMAIL=...                # Email address for OTP
GOOGLE_CLIENT_ID=...     # Gmail OAuth2 client ID
GOOGLE_CLIENT_SECRET=... # Gmail OAuth2 client secret
GOOGLE_REFRESH_TOKEN=... # Gmail OAuth2 refresh token
JWT_SECRET=...           # Secret for JWT signing
```

### Frontend (`frontend/.env`)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Quick Start

1. Create a `.env` file with all required secrets (see below)
2. Set up hardware components (webcam, ultrasonic sensor, robot, etc.)
3. Start the backend API: `python -m bot_core.api_server`
4. Start the frontend: `cd frontend && npm install && npm run dev`
5. Run `python -m bot_core.main` for the main assistant (optional)
6. Run `python -m RL.main_loop` for the RL agent (optional)

---

## Step-by-Step Setup Guide

### Backend (API Server)

1. **Create and activate a virtual environment (recommended):**
   ```powershell
   python -m venv myenv
   .\myenv\Scripts\Activate.ps1
   ```
2. **Upgrade pip (optional):**
   ```powershell
   pip install --upgrade pip
   ```
3. **Install Python dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```
4. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in all secrets (see above).
5. **Run the backend API server:**
   ```powershell
   python -m bot_core.api_server
   ```
6. **(Optional) Run tests:**
   ```powershell
   python test.py
   ```

### Frontend (Cyberpunk Dashboard)

1. **Install Node.js (v18+ recommended)**
2. **Install dependencies:**
   ```powershell
   cd frontend
   npm install
   ```
3. **Configure environment variables:**
   - Create `frontend/.env` with:
     ```
     NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
     ```
4. **Run the frontend:**
   ```powershell
   npm run dev
   ```

### Deployment

- **Local:** Run backend and frontend as above.
- **Production:**
  - Use a production WSGI server (e.g., gunicorn) for backend
  - Use `npm run build && npm start` for frontend
  - Set all environment variables securely
  - (Optional) Use Docker for containerized deployment

---

## Dashboard Overview

The Cyberpunk Dashboard provides a modern, neon-themed interface for interacting with SteveRLBot. After logging in, users can:

- View their username and email in the sidebar profile card (fetched from `/me` API)
- See a live digital clock and system resource monitor (CPU, RAM, network usage from `/system_stats`)
- Get AI tips/news and use a quick command bar (demo)
- View system status, detected objects, and recent conversation
- Use quick actions (clear memory, export chat, toggle theme)
- Manually control the robot/device (via `/control` API)

**Access:** Visit `http://localhost:3000/dashboard` after login.

## How to Interact

- **Web Dashboard**: Modern UI for stats, chat, device control, and more.
- **API**: See `API_DOCS.txt` for all endpoints, input/output, and authentication details.
- **CLI**: Type commands at the prompt and press Enter (see above for special commands).

---

## API Reference (Summary)

See `API_DOCS.txt` for full details. Here are the main endpoints:

| Method | Endpoint      | Auth | Purpose                                 |
| ------ | ------------- | ---- | --------------------------------------- |
| POST   | /send_otp     | No   | Send OTP to user email                  |
| POST   | /verify_otp   | No   | Verify OTP for email                    |
| POST   | /register     | No   | Register new user (after OTP)           |
| POST   | /login        | No   | User login, returns JWT                 |
| POST   | /verify       | No   | Mark email as verified (optional)       |
| POST   | /chat         | Yes  | Send chat message, get bot reply        |
| GET    | /memory       | Yes  | Get recent conversation, summary, objs  |
| GET    | /stats        | Yes  | Get today's stats (summary, mood, etc.) |
| POST   | /control      | Yes  | Control robot/devices (move, etc)       |
| GET    | /system_stats | No   | Get system CPU, RAM, and network usage  |
| GET    | /me           | Yes  | Get current user's username and email   |

**All endpoints return JSON. Auth endpoints require JWT in the Authorization header.**

---

## Notes

- All commands should be run from the project root
- See `setup_commands.txt` for a full list of setup instructions
- All API endpoints and secrets are now loaded from `.env` (never hardcoded)
- Git history has been cleaned of secrets and is safe for GitHub
- Dashboard and stats pages now use a modern Astra (space/console) theme
- Device/robot control is available from the dashboard and via API

---

## Troubleshooting & FAQ

- **CORS errors:** Ensure backend is running and CORS is enabled for frontend origin.
- **DB connection issues:** Check PostgreSQL credentials and network/firewall settings.
- **Email/OTP not sending:** Verify Gmail OAuth2 credentials and refresh token.
- **Frontend can't reach backend:** Check `NEXT_PUBLIC_API_BASE_URL` and backend port.
- **Secrets in git:** Use `git filter-repo` to scrub history and always use `.env`.

---

## Security Practices

- All passwords are hashed before storage.
- JWT is used for all user-specific endpoints.
- All secrets are loaded from `.env` and never hardcoded.
- CORS is enabled and restricted to frontend origin.
- Git history has been scrubbed of secrets.

---

## License

Specify your license here (MIT, GPL, or "All rights reserved").

---

## Credits & Acknowledgments

- Cyberpunk UI inspired by open source neon/cyberpunk design systems.
- Uses Next.js, React, Tailwind CSS, Flask, PyTorch, Google Gemini, and more.

---

---

---

## Recent Changes (as of June 5, 2025)

- **Security:** All secrets moved to `.env`, JWT for all user endpoints, PostgreSQL for all user/chat data.
- **Frontend:** Modern dashboard layout, Astra theme, device control panel, and improved navigation.
- **Backend:** New `/control` API for robot/device commands, all endpoints CORS and JWT protected.
- **Docs:** See `API_DOCS.txt` for all API endpoints, input/output, and authentication.

This README is up to date as of June 5, 2025.
