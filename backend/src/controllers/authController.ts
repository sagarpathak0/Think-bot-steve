import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/authMiddleware.js';
import { sendOtpEmail } from '../utils/email.js';
import {
  findUserByUsernameOrEmail,
  insertPendingVerification,
  findPendingVerification,
  deletePendingVerification,
  findUserByUsernameOrEmailForRegister,
  insertUser,
  verifyUserEmail,
  getUserById
} from '../queries/authQueries.js';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Invalid credentials' });
    return;
  }
  try {
    const user = await findUserByUsernameOrEmail(username);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }
    if (!user.is_verified) {
      res.status(403).json({ error: 'Email not verified' });
      return;
    }
    const token = generateToken({ user_id: user.id });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'No email provided' });
    return;
  }
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  try {
    await insertPendingVerification(email, otp);
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: 'OTP sent' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ error: 'Missing email or otp' });
    return;
  }
  try {
    const record = await findPendingVerification(email);
    if (!record) {
      res.status(400).json({ error: 'No OTP found for this email' });
      return;
    }
    const createdAt = new Date(record.created_at);
    if (record.otp !== otp || (Date.now() - createdAt.getTime()) > 5 * 60 * 1000) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }
    res.json({ success: true, message: 'OTP verified. You can now register.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }
  try {
    const pending = await findPendingVerification(email);
    if (!pending) {
      res.status(400).json({ error: 'Please verify your email with OTP before registering.' });
      return;
    }
    const user = await findUserByUsernameOrEmailForRegister(username, email);
    if (user) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user_id = await insertUser(username, email, password_hash);
    await deletePendingVerification(email);
    res.json({ success: true, user_id, message: 'Registration complete. You can now log in.' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'No email provided' });
    return;
  }
  try {
    await verifyUserEmail(email);
    res.json({ success: true, message: 'Email verified' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const user_id = (req as any).user.user_id;
  try {
    const user = await getUserById(user_id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ username: user.username, email: user.email, is_verified: user.is_verified });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
};
