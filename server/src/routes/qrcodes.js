import { Router } from 'express';
const router = Router();

import { createQRCode, getQRCode, updateQRCode, deleteQRCode, viewDocumentByQR, getQRCodeStats } from '../controllers/qrcodes.js';

import { protect, authorize } from '../middleware/auth.js';

// Public route for viewing documents via QR
router.get('/:qr_id/view', viewDocumentByQR);

// Protected routes
router.use(protect);

router.route('/')
  .post(authorize('admin', 'supervisor'), createQRCode);

router.route('/:qr_id')
  .get(getQRCode)
  .put(authorize('admin', 'supervisor'), updateQRCode)
  .delete(authorize('admin'), deleteQRCode);

router.get('/:qr_id/stats', authorize('admin', 'supervisor'), getQRCodeStats);

export default router;
