import express from 'express';
import { chat, getMemory, getStats } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', requireAuth, chat);
router.get('/memory', requireAuth, getMemory);
router.get('/stats', requireAuth, getStats);

export default router;
