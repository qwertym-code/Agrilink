import { Router } from 'express';
import {
  createOrder, myOrders, getOrder, incomingOrders, fulfilOrderItems, cancelOrder,
} from '../controllers/orderController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, requireRole('consumer'), createOrder);
router.get('/', protect, requireRole('consumer'), myOrders);

// Before '/:id' so "incoming" is not read as an order id.
router.get('/incoming', protect, requireRole('retailer'), incomingOrders);

router.patch('/:id/fulfil', protect, requireRole('retailer'), fulfilOrderItems);

// No requireRole: buyers, sellers and admins may all cancel. The controller
// checks the caller's relationship to this specific order.
router.patch('/:id/cancel', protect, cancelOrder);

router.get('/:id', protect, getOrder);

export default router;
