import { Router } from 'express';
import {
  listProducts, getProduct, myProducts,
  createProduct, updateProduct, deleteProduct,
} from '../controllers/productController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();

// Browsing is open — shoppers should see produce before signing up.
router.get('/', listProducts);

// Declared before '/:id' so "mine" is not swallowed as a product id.
router.get('/mine', protect, requireRole('retailer'), myProducts);

router.get('/:id', getProduct);

router.post('/', protect, requireRole('retailer'), createProduct);
router.patch('/:id', protect, requireRole('retailer'), updateProduct);
router.delete('/:id', protect, requireRole('retailer'), deleteProduct);

export default router;
