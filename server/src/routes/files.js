import { Router } from 'express';
import { downloadFile, streamFile } from '../controllers/files.js';

const router = Router();

import { protect } from '../middleware/auth.js';

// Protect all routes
router.use(protect);

// Routes for file operations
router.get('/download/:filePath', downloadFile);
router.get('/stream/:filePath', streamFile);

export default router;
