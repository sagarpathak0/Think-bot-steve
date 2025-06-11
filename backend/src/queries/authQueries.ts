import { pool } from '../db.js';

export const findUserByUsernameOrEmail = async (usernameOrEmail: string) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [usernameOrEmail]);
  return rows.length > 0 ? rows[0] : null;
};

export const insertPendingVerification = async (email: string, otp: string) => {
  await pool.query(
    `INSERT INTO pending_verifications (email, otp, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (email) DO UPDATE SET otp = $2, created_at = NOW()`,
    [email, otp]
  );
};

export const findPendingVerification = async (email: string) => {
  const { rows } = await pool.query('SELECT otp, created_at FROM pending_verifications WHERE email = $1', [email]);
  return rows.length > 0 ? rows[0] : null;
};

export const deletePendingVerification = async (email: string) => {
  await pool.query('DELETE FROM pending_verifications WHERE email = $1', [email]);
};

export const findUserByUsernameOrEmailForRegister = async (username: string, email: string) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
  return rows.length > 0 ? rows[0] : null;
};

export const insertUser = async (username: string, email: string, password_hash: string) => {
  const insertRes = await pool.query(
    'INSERT INTO users (username, email, password, is_verified) VALUES ($1, $2, $3, $4) RETURNING id',
    [username, email, password_hash, true]
  );
  return insertRes.rows[0].id;
};

export const verifyUserEmail = async (email: string) => {
  await pool.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [email]);
};

export const getUserById = async (user_id: number) => {
  const { rows } = await pool.query('SELECT username, email, is_verified FROM users WHERE id = $1', [user_id]);
  return rows.length > 0 ? rows[0] : null;
};
