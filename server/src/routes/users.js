import { Router } from 'express';
const router = Router();

import { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser, 
  updateUserPassword,
  getUserStats 
} from '../controllers/users.js';

import { protect, authorize } from '../middleware/auth.js';

// All routes require authentication and admin privileges
router.use(protect);
router.use(authorize('admin'));

// User statistics route
router.get('/stats', getUserStats);

// Main user routes
router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Password update route
router.put('/:id/password', updateUserPassword);

export default router;
