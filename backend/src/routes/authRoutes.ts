import express from 'express';
import { login, sendOtp, verifyOtp, register, verifyEmail, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/send_otp', sendOtp);
router.post('/verify_otp', verifyOtp);
router.post('/register', register);
router.post('/verify', verifyEmail);
router.get('/me', requireAuth, getMe);

export default router;
