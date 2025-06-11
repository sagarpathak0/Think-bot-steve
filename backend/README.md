# Node Backend (TypeScript)

This backend replicates the core functionality of the Python `bot_core`:
- User authentication (login, JWT)
- Chat endpoint (calls Gemini API, stores/retrieves messages)
- Memory and stats endpoints (conversation history, summary, mood, etc.)
- Uses PostgreSQL for storage
- Uses two Gemini API keys: one for normal chat, one for summary generation
- No audio or vision features

## Endpoints
- `POST /login` — Authenticate user, returns JWT
- `POST /chat` — Send chat message, get bot reply
- `GET /memory` — Get recent conversation, summary, objects
- `GET /stats` — Get today's stats (summary, mood, message count, etc.)

## Setup
1. Copy your `.env` file with DB and Gemini API keys to this folder
2. Run `npm install`
3. Run `npx ts-node src/index.ts` to start the server (after code is implemented)
