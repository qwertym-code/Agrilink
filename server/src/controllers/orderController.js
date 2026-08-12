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

/**
 * The order's overall status is derived from its lines rather than set by
 * hand, so it can never disagree with them.
 */
function deriveStatus(order) {
  const fulfilled = order.items.filter((item) => item.fulfilled).length;
  if (fulfilled === 0) return 'placed';
  if (fulfilled === order.items.length) return 'delivered';
  return 'out-for-delivery'; // some farms have handed over, others haven't
}

/**
 * PATCH /api/orders/:id/fulfil — retailers only.
 * Body: { fulfilled?: boolean }  (defaults to true; false undoes a mistake)
 *
 * Marks only the caller's own lines. Other farms' items in the same basket are
 * untouched.
 */
export const fulfilOrderItems = asyncHandler(async (req, res) => {
  const fulfilled = req.body.fulfilled !== false;

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const mine = order.items.filter((item) => item.retailer.equals(req.user._id));
  if (mine.length === 0) {
    throw new ApiError(403, 'This order contains none of your produce');
  }

  if (order.status === 'cancelled') {
    throw new ApiError(400, 'This order was cancelled and cannot be updated');
  }

  for (const item of mine) {
    item.fulfilled = fulfilled;
    item.fulfilledAt = fulfilled ? new Date() : undefined;
  }

  order.status = deriveStatus(order);
  await order.save();

  res.json({
    status: order.status,
    fulfilled,
    // How much of the whole basket is done — useful when other farms share it.
    progress: {
      done: order.items.filter((i) => i.fulfilled).length,
      total: order.items.length,
    },
  });
});

/**
 * PATCH /api/orders/:id/cancel
 * Body: { reason }
 *
 * Either side may cancel: a buyer changes their mind, or a farmer cannot
 * supply. Both must say why.
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const reason = String(req.body.reason || '').trim();

  if (reason.length < 3) {
    throw new ApiError(400, 'Please give a short reason for cancelling');
  }
  if (reason.length > 300) {
    throw new ApiError(400, 'Keep the reason under 300 characters');
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const isBuyer = order.consumer.equals(req.user._id);
  const isSeller = order.items.some((item) => item.retailer.equals(req.user._id));
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isSeller && !isAdmin) {
    throw new ApiError(403, 'You cannot cancel this order');
  }

  if (order.status === 'cancelled') {
    throw new ApiError(400, 'This order is already cancelled');
  }
  // Once produce has changed hands, cancelling is a refund conversation, not
  // a status change — so the system refuses rather than pretending.
  if (order.status === 'delivered') {
    throw new ApiError(400, 'This order was already delivered and cannot be cancelled');
  }

  order.status = 'cancelled';
  order.cancellation = {
    reason,
    at: new Date(),
    by: req.user._id,
    byRole: isBuyer ? 'consumer' : isSeller ? 'retailer' : 'admin',
  };

  await order.save();

  // Stock was decremented when the order was placed, so cancelling has to put
  // it back — otherwise every cancellation quietly destroys inventory.
  await Promise.all(
    order.items.map((item) =>
      Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
    )
  );

  res.json({ status: order.status, cancellation: order.cancellation });
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
      cancellation: order.cancellation?.reason ? order.cancellation : undefined,
      itemsTotal: money(mine.reduce((sum, item) => sum + item.price * item.quantity, 0)),
      // Whether THIS retailer's part is done — the order's own status may
      // still say in-progress while another farm finishes its lines.
      mineFulfilled: mine.every((item) => item.fulfilled),
      sharedWithOtherFarms: mine.length !== order.items.length,
    };
  });

  res.json({ orders: scoped });
});
