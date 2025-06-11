
# Think-Bot (SteveRLBot)

Think-Bot (SteveRLBot) is a modular, voice-activated AI assistant and reinforcement learning (RL) agent. It features a modern cyberpunk dashboard, conversational AI, persistent memory, device/robot control, computer vision, and a DQN-based RL agent. The codebase is organized for easy extension and deployment.

---

## Cyberpunk Theme

The dashboard and all web UI use a custom **cyberpunk/neon** theme with:

- Futuristic neon colors (blue, pink, purple, green)
- Glitch and HUD effects
- Pixel/monospace fonts
- Animated backgrounds and console-style layouts

For a visual preview, see the `frontend/src/styles/globals.css` and the dashboard page.

---


## Features

- **Web Dashboard**: Modern, multi-section dashboard (Astra/cyberpunk style) for stats, chat, device control, and more (Next.js frontend)
- **Modular Node.js Backend**: TypeScript backend with controllers, middleware, queries, and routes (see below)
- **User Authentication**: Registration/login with email OTP, JWT-secured endpoints, and PostgreSQL user storage
- **Conversational AI**: Uses Gemini AI for context-aware responses and conversation summaries
- **Stats & Memory**: Per-user stats, mood, and conversation history, all stored in PostgreSQL
- **Device/Robot Control**: Control robot movement (forward, back, left, right, stop) from the dashboard or API
- **Computer Vision**: Face detection, object detection (YOLOv5), and OCR (Tesseract) via webcam
- **Speech Recognition**: Wake word detection ("Steve") and command recognition
- **Text-to-Speech (TTS)**: Natural-sounding speech with Edge TTS and pygame audio playback
- **Personality & Skills**: Tells jokes, gives time/weather, remembers preferences
- **Multilingual**: Detects and translates languages
- **Hardware Integration**: ESP8266 with ultrasonic sensor for obstacle detection
- **Reinforcement Learning**: DQN agent learns to navigate a grid world with obstacles and goals

## Memory System Details

- All conversations and object memories are stored in `bot_memory.json`.
- Example structure:
  - `conversation_history`: List of all user and bot messages with timestamps
  - `object_memory`: Dictionary of objects and their descriptions
  - `last_seen`: Last seen timestamp for each object
- Memory is updated automatically after every conversation or object event.
- You can recall objects or search memory using text commands.

## Architecture

The project uses a modular, multi-language architecture:

- `frontend/`: Next.js cyberpunk dashboard (Vercel-ready)
- `backend/`: Node.js/TypeScript API (modular, Vercel-ready)
- `bot_core/`: Python package for advanced AI, RL, and hardware integration
- `RL/`: Standalone reinforcement learning agent
### Backend (Node.js/TypeScript)

- Modular structure: `controllers/`, `middleware/`, `queries/`, `routes/`, `utils/`
- Endpoints: `/login`, `/chat`, `/memory`, `/stats` (see backend/README.md)
- Uses PostgreSQL for storage and Gemini API for chat/summaries
- Deployed as a serverless API on Vercel (see `backend/vercel.json`)

### Frontend (Next.js)
- Modern dashboard UI, cyberpunk theme, connects to backend via `NEXT_PUBLIC_API_BASE_URL`
- Deployed on Vercel

### Python Core (bot_core/)
- Advanced AI, RL, and hardware integration (see `bot_core/README.md`)
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

### Backend (`backend/.env`)
See `backend/README.md` for a full example. Main variables:
```
PGDATABASE=thinkBot
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGHOST=your_db_host
PGPORT=your_db_port
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_2=your_gemini_api_key_2
EMAIL=your_email
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
JWT_SECRET=your_jwt_secret
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=https://<your-vercel-backend-url>
```

---


## Quick Start

1. Create `.env` files for backend and frontend (see above)
2. Set up hardware components (webcam, ultrasonic sensor, robot, etc.)
3. Start the backend:
   - For Node.js backend: 
     ```powershell
     cd backend
     npm install
     npx ts-node src/index.ts
     ```
   - For Python backend (legacy/advanced):
     ```powershell
     python -m bot_core.api_server
     ```
4. Start the frontend:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
5. (Optional) Run the main Python assistant:
   ```powershell
   python -m bot_core.main
   ```
6. (Optional) Run the RL agent:
   ```powershell
   python -m RL.main_loop
   ```

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

---


## Deployment

### Backend (Node.js/TypeScript)
- Deploys as a serverless API on Vercel (see `backend/vercel.json`)
- Set all environment variables in the Vercel dashboard
- API base URL: `https://<your-vercel-backend-url>`

### Frontend (Next.js)
- Deploys on Vercel (auto-detected)
- Set `NEXT_PUBLIC_API_BASE_URL` in Vercel dashboard to your backend URL

### Python Core (optional/legacy)
- Can be deployed on a server/VM (see `DEPLOYMENT_GUIDE.txt`)

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.txt](./DEPLOYMENT_GUIDE.txt).

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

...........

---

## Credits & Acknowledgments

- Cyberpunk UI inspired by open source neon/cyberpunk design systems.
- Uses Next.js, React, Tailwind CSS, Flask, PyTorch, Google Gemini, and more.

---

---

---


## Recent Changes (as of June 11, 2025)

- **Backend:**
  - Migrated to modular Node.js/TypeScript backend (controllers, middleware, queries, routes, utils)
  - Vercel deployment with `vercel.json` (serverless API)
  - All endpoints use conversation summaries for context
  - All business logic modularized for maintainability
- **Frontend:**
  - Modern cyberpunk dashboard (Next.js, Vercel)
  - API base URL now points to Vercel backend
- **Docs:**
  - Updated backend and main project README for new architecture and deployment

This README is up to date as of June 11, 2025.
