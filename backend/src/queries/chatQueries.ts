import { pool } from '../db.js';

export const insertConversation = (user_id: number, speaker: string, message: string) =>
  pool.query(
    'INSERT INTO conversation_history (user_id, timestamp, speaker, message) VALUES ($1, NOW(), $2, $3)',
    [user_id, speaker, message]
  );

export const getLastSummary = async (user_id: number) => {
  const { rows } = await pool.query(
    'SELECT summary FROM summaries WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
    [user_id]
  );
  return rows.length > 0 ? rows[0].summary : '';
};

export const getUsername = async (user_id: number) => {
  const { rows } = await pool.query('SELECT username FROM users WHERE id = $1', [user_id]);
  return rows.length > 0 ? rows[0].username : '';
};

export const getConversationHistory = async (user_id: number) => {
  const { rows } = await pool.query(
    'SELECT speaker, message FROM conversation_history WHERE user_id=$1 ORDER BY timestamp ASC LIMIT 30',
    [user_id]
  );
  return rows;
};

export const insertSummary = (user_id: number, summary: string) =>
  pool.query(
    'INSERT INTO summaries (user_id, summary) VALUES ($1, $2)',
    [user_id, summary]
  );

export const getMemoryHistory = async (user_id: number) => {
  const { rows } = await pool.query(
    'SELECT timestamp, speaker, message FROM conversation_history WHERE user_id=$1 ORDER BY timestamp ASC LIMIT 30',
    [user_id]
  );
  return rows;
};

export const getTodayHistory = async (user_id: number, today: string) => {
  const { rows } = await pool.query(
    `SELECT timestamp, speaker, message FROM conversation_history WHERE user_id=$1 AND to_char(timestamp, 'YYYY-MM-DD') = $2 ORDER BY timestamp ASC`,
    [user_id, today]
  );
  return rows;
};
