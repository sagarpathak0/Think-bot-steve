
# Think-Bot Node.js Backend (TypeScript)

This is the Node.js backend for the Think-Bot chat application. It provides authentication, chat, memory, and system stats endpoints, using PostgreSQL for storage and Gemini API for AI responses and conversation summaries.

## Features
- Modular structure: controllers, middleware, queries, routes, and utils
- User authentication (JWT, Google OAuth, OTP email)
- Chat endpoint with Gemini API integration and conversation summary context
- Memory and stats endpoints (conversation history, summary, mood, message count)
- PostgreSQL database
- Ready for deployment on Vercel (see `vercel.json`)

## API Endpoints
- `POST /login` — Authenticate user, returns JWT
- `POST /chat` — Send chat message, get bot reply (uses conversation summary for context)
- `GET /memory` — Get recent conversation, summary, and objects
- `GET /stats` — Get today's stats (summary, mood, message count, etc.)

## Project Structure

```
backend/
  src/
    controllers/    # Business logic (authController, chatController, systemController)
    middleware/      # Middleware (requireAuth, generateToken)
    queries/         # Database queries (authQueries, chatQueries, systemQueries)
    routes/          # Route definitions (authRoutes, chatRoutes, systemRoutes)
    utils/           # Utility functions (email, etc.)
    db.ts            # Database connection
    gemini.ts        # Gemini API integration
    index.ts         # App entry point
  init.sql          # SQL for DB table setup
  vercel.json       # Vercel deployment config
  package.json      # NPM dependencies and scripts
  tsconfig.json     # TypeScript config
  .env              # Environment variables (not committed)
```

## Setup & Local Development
1. Copy your `.env` file with DB and Gemini API keys to the `backend/` folder (see example below).
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the server locally:
   ```powershell
   npx ts-node src/index.ts
   ```

## Deployment (Vercel)
1. Ensure `vercel.json` is present in the `backend/` folder (already included).
2. Push your code to GitHub and import the project in Vercel.
3. In the Vercel dashboard, set all environment variables from your `.env` file (DB, Gemini API keys, email, etc.).
4. Vercel will auto-detect the backend and deploy it as a serverless API.
5. Your API will be available at `https://<your-vercel-backend-url>`.

## Example .env
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

## Notes
- All business logic is modularized for maintainability.
- The chat endpoint uses conversation summaries as context for better AI replies.
- The backend is ready for Vercel deployment; see `vercel.json` for config.
- For production, always set environment variables in the Vercel dashboard.
