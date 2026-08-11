import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const PUBLIC_FIELDS = 'name description price unit category imageUrl tags stock rating retailer createdAt';

/**
 * GET /api/products
 * Query: q, category, tag, sort (price-asc|price-desc|newest), page, limit
 */
export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, tag, sort = 'newest' } = req.query;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const filter = { isActive: true };
  if (category && category !== 'all') filter.category = category;
  if (tag && tag !== 'all') filter.tags = tag;

  // Regex rather than $text: shoppers type partial words ("toma"), which a
  // text index will not match since it only indexes whole terms.
  if (q) filter.name = { $regex: q.trim(), $options: 'i' };

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    newest: { createdAt: -1 },
  };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .select(PUBLIC_FIELDS)
      .populate('retailer', 'farmName location')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

/** GET /api/products/:id */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true })
    .select(PUBLIC_FIELDS)
    .populate('retailer', 'farmName location');

  if (!product) throw new ApiError(404, 'Product not found');

  res.json({ product });
});

/** GET /api/products/mine — the signed-in retailer's own listings. */
export const myProducts = asyncHandler(async (req, res) => {
  const items = await Product.find({ retailer: req.user._id, isActive: true }).sort({ createdAt: -1 });
  res.json({ items, total: items.length });
});

/** POST /api/products — retailers only. */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, unit, category, imageUrl, tags, stock } = req.body;

  // retailer comes from the token, never the body — otherwise anyone could
  // create listings attributed to another farm.
  const product = await Product.create({
    name, description, price, unit, category, imageUrl, tags, stock,
    retailer: req.user._id,
  });

  res.status(201).json({ product });
});

/** Loads a product and refuses it unless the caller owns it. */
async function findOwned(id, userId) {
  const product = await Product.findById(id);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  if (!product.retailer.equals(userId)) {
    throw new ApiError(403, 'You can only manage your own listings');
  }
  return product;
}

/** PATCH /api/products/:id */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await findOwned(req.params.id, req.user._id);

  // Allow-list: retailer and isActive must not be settable from the body.
  for (const field of ['name', 'description', 'price', 'unit', 'category', 'imageUrl', 'tags', 'stock']) {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  }

  await product.save();
  res.json({ product });
});

/** DELETE /api/products/:id — soft delete, so past orders keep resolving. */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await findOwned(req.params.id, req.user._id);
  product.isActive = false;
  await product.save();
  res.json({ message: 'Listing removed' });
});
