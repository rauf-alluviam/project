import { Router } from 'express';
import { getScanLogs, getScanAnalytics } from '../controllers/logs.js';

const router = Router();

import { protect, authorize } from '../middleware/auth.js';

// Protect all routes
router.use(protect);

// Get scan logs with filters
router.get('/scan', authorize('admin', 'supervisor'), getScanLogs);

// Get scan analytics
router.get('/analytics', authorize('admin', 'supervisor'), getScanAnalytics);

export default router;
