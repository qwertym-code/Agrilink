import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import { money } from '../config/pricing.js';

const DAYS = 14;

/**
 * GET /api/admin/stats — admins only.
 *
 * Returns aggregate counts exclusively. No names, emails, phone numbers or
 * addresses: a dashboard needs totals, and shipping personal data to the
 * browser to display a number would be an unnecessary exposure.
 */
export const getStats = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (DAYS - 1));

  const [
    usersByRole,
    productCount,
    outOfStock,
    productsByCategory,
    orderTotals,
    ordersByStatus,
    ordersByPayment,
    ordersPerDay,
    topProducts,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),

    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: { $lte: 0 } }),

    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    Order.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
          items: { $sum: { $sum: '$items.quantity' } },
        },
      },
    ]),

    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),

    Order.aggregate([{ $group: { _id: '$paymentMethod', count: { $sum: 1 } } }]),

    // Grouped by date string in UTC. Good enough for a dashboard; a
    // timezone-correct version would need $dateToString with a timezone arg.
    Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          units: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { units: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const roleCount = (role) => usersByRole.find((r) => r._id === role)?.count || 0;
  const totals = orderTotals[0] || { count: 0, revenue: 0, items: 0 };

  // Fill missing days with zeroes so the chart shows a continuous axis rather
  // than silently collapsing quiet days.
  const byDate = new Map(ordersPerDay.map((d) => [d._id, d]));
  const timeline = [];
  for (let i = 0; i < DAYS; i += 1) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    const found = byDate.get(key);
    timeline.push({
      date: key,
      orders: found?.orders || 0,
      revenue: money(found?.revenue || 0),
    });
  }

  res.json({
    users: {
      total: usersByRole.reduce((sum, r) => sum + r.count, 0),
      consumers: roleCount('consumer'),
      retailers: roleCount('retailer'),
      admins: roleCount('admin'),
    },
    products: {
      total: productCount,
      outOfStock,
      byCategory: productsByCategory.map((c) => ({ category: c._id, count: c.count })),
    },
    orders: {
      total: totals.count,
      itemsSold: totals.items,
      revenue: money(totals.revenue),
      averageOrder: totals.count ? money(totals.revenue / totals.count) : 0,
      byStatus: ordersByStatus.map((s) => ({ status: s._id, count: s.count })),
      byPayment: ordersByPayment.map((p) => ({ method: p._id, count: p.count })),
    },
    timeline,
    topProducts: topProducts.map((p) => ({
      name: p._id,
      units: p.units,
      revenue: money(p.revenue),
    })),
  });
});
