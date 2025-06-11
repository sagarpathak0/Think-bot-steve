import express from 'express';
import { getSystemStats, control } from '../controllers/systemController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/system_stats', getSystemStats);
router.post('/control', requireAuth, control);

export default router;
