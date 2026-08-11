import { Router } from 'express';
import { getStats } from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

// Every route here is admin-only. requireRole runs after protect, so an
// unauthenticated request gets 401 and a signed-in non-admin gets 403.
router.get('/stats', protect, requireRole('admin'), getStats);

export default router;
