import { Router } from 'express';
const router = Router();

import { getDocuments, getDocument, createDocument, updateDocument, deleteDocument, uploadVersion, getVersions } from '../controllers/documents.js';

import { protect, authorize } from '../middleware/auth.js';

// All routes require authentication
router.use(protect);

// Routes with specific role requirements
router.route('/')
  .get(getDocuments)
  .post(authorize('admin', 'supervisor'), createDocument);

router.route('/:id')
  .get(getDocument)
  .put(authorize('admin', 'supervisor'), updateDocument)
  .delete(authorize('admin'), deleteDocument);

router.route('/:id/versions')
  .get(getVersions)
  .post(authorize('admin', 'supervisor'), uploadVersion);

export default router;
