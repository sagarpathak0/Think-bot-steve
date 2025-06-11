-- Create summaries table for storing conversation summaries per user
CREATE TABLE IF NOT EXISTS summaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
