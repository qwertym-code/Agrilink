import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { calcDeliveryFee, money } from '../config/pricing.js';

/**
 * POST /api/orders — consumers only.
 * Body: { items: [{ product, quantity }], deliveryAddress, paymentMethod }
 *
 * Prices are read from the database and the totals recomputed here. The client
 * sends product ids and quantities only; any price it might send is ignored,
 * because a request body is user input and cannot be trusted to price an order.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, deliveryAddress, paymentMethod = 'cod' } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Your cart is empty');
  }

  // Collapse duplicate lines so the same product twice cannot bypass stock checks.
  const quantities = new Map();
  for (const line of items) {
    if (!mongoose.isValidObjectId(line?.product)) throw new ApiError(400, 'Invalid product in cart');
    const qty = Number(line.quantity);
    if (!Number.isInteger(qty) || qty < 1) throw new ApiError(400, 'Invalid quantity in cart');
    quantities.set(String(line.product), (quantities.get(String(line.product)) || 0) + qty);
  }

  const products = await Product.find({ _id: { $in: [...quantities.keys()] }, isActive: true });

  if (products.length !== quantities.size) {
    throw new ApiError(400, 'One or more items are no longer available');
  }

  const orderItems = products.map((product) => {
    const quantity = quantities.get(String(product._id));

    if (product.stock < quantity) {
      throw new ApiError(400, `Only ${product.stock} left of ${product.name}`);
    }

    return {
      product: product._id,
      retailer: product.retailer,
      name: product.name,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      quantity,
    };
  });

  const subtotal = money(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const deliveryFee = calcDeliveryFee(subtotal);
  const total = money(subtotal + deliveryFee);

  // 'card' is a demo path that charges nothing; recording it as 'simulated'
  // keeps unpaid demo orders distinguishable from genuine cash-on-delivery.
  const paymentStatus = paymentMethod === 'card' ? 'simulated' : 'pending';

  const order = await Order.create({
    consumer: req.user._id,
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress,
    paymentMethod,
    paymentStatus,
  });

  // Decrement stock only once the order is safely written.
  await Promise.all(
    orderItems.map((item) =>
      Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
    )
  );

  res.status(201).json({ order });
});

/** GET /api/orders — the signed-in consumer's own orders. */
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ consumer: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

/** GET /api/orders/:id — own order only. */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  // Consumers see their own; retailers see orders containing their produce.
  const isOwner = order.consumer.equals(req.user._id);
  const isSeller = order.items.some((item) => item.retailer.equals(req.user._id));
  if (!isOwner && !isSeller) throw new ApiError(403, 'You do not have access to this order');

  res.json({ order });
});

/** GET /api/orders/incoming — orders containing the retailer's produce. */
export const incomingOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'items.retailer': req.user._id })
    .sort({ createdAt: -1 })
    .populate('consumer', 'name phone');

  // Strip other retailers' lines: a seller has no business seeing what else
  // the customer bought elsewhere in the same basket.
  const scoped = orders.map((order) => {
    const mine = order.items.filter((item) => item.retailer.equals(req.user._id));
    return {
      _id: order._id,
      createdAt: order.createdAt,
      status: order.status,
      paymentMethod: order.paymentMethod,
      consumer: order.consumer,
      deliveryAddress: order.deliveryAddress,
      items: mine,
      itemsTotal: money(mine.reduce((sum, item) => sum + item.price * item.quantity, 0)),
    };
  });

  res.json({ orders: scoped });
});
