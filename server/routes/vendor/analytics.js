const express = require('express');
const prisma  = require('../../lib/prisma');
const { verifyToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

const router = express.Router();
router.use(verifyToken, requireRole('vendor'));

/** GET /api/vendor/analytics/summary — FR-02.4: Sales analytics */
router.get('/summary', async (req, res) => {
  try {
    const vendorId = req.user.vendorId;
    const { period = '7d' } = req.query;

    const msMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days  = msMap[period] || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [allTimeAgg, periodAgg, ordersByStatusGroup, paidOrdersSince] = await Promise.all([
      prisma.order.aggregate({
        where: { vendorId, paymentStatus: 'paid' },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { vendorId, paymentStatus: 'paid', createdAt: { gte: since } },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where: { vendorId },
        _count: { id: true },
      }),
      prisma.order.findMany({
        where: { vendorId, paymentStatus: 'paid', createdAt: { gte: since } },
        include: { items: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const ordersByStatus = ordersByStatusGroup.map((g) => ({ _id: g.status, count: g._count.id }));

    // Top products aggregation
    const productMap = {};
    const dailyMap = {};

    paidOrdersSince.forEach((order) => {
      const day = order.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { _id: day, revenue: 0, orders: 0 };
      dailyMap[day].revenue += (order.total || 0);
      dailyMap[day].orders += 1;

      order.items.forEach((item) => {
        const pId = item.productId || item.name;
        if (!productMap[pId]) productMap[pId] = { _id: pId, name: item.name, revenue: 0, sold: 0 };
        productMap[pId].revenue += (item.price * item.quantity);
        productMap[pId].sold += item.quantity;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const dailyRevenue = Object.values(dailyMap)
      .sort((a, b) => a._id.localeCompare(b._id));

    res.json({
      allTime: { total: allTimeAgg._sum.total || 0, count: allTimeAgg._count.id || 0 },
      period:  { total: periodAgg._sum.total || 0, count: periodAgg._count.id || 0 },
      ordersByStatus,
      topProducts,
      dailyRevenue,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
