import { Router } from 'express';
import { createOrder, myOrders, getOrder, incomingOrders } from '../controllers/orderController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, requireRole('consumer'), createOrder);
router.get('/', protect, requireRole('consumer'), myOrders);

// Before '/:id' so "incoming" is not read as an order id.
router.get('/incoming', protect, requireRole('retailer'), incomingOrders);

router.get('/:id', protect, getOrder);

export default router;
