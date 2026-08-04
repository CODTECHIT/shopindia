const express = require('express');
const prisma = require('../../lib/prisma');
const { verifyToken }      = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');

const router = express.Router();

// All dashboard routes require auth + manage_dashboard permission (or super_admin)
router.use(verifyToken, requirePermission('manage_dashboard', 'view_dashboard'));

/** GET /api/admin/dashboard — FR-05.1 */
router.get('/', async (_req, res) => {
  try {
    const [
      totalUsers, totalVendors, totalRiders, totalOrders,
      pendingVendors, openTickets, revenueAgg,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.user.count({ where: { role: 'vendor' } }),
      prisma.user.count({ where: { role: 'rider' } }),
      prisma.order.count(),
      prisma.vendor.count({ where: { approvalStatus: 'pending' } }),
      prisma.ticket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'paid' },
      }),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, total: true },
    });

    const dailyMap = {};
    recentOrders.forEach((o) => {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { _id: day, count: 0, revenue: 0 };
      dailyMap[day].count += 1;
      dailyMap[day].revenue += (o.total || 0);
    });
    const dailyOrders = Object.values(dailyMap).sort((a, b) => a._id.localeCompare(b._id));

    res.json({
      stats: {
        totalUsers,
        totalVendors,
        totalRiders,
        totalOrders,
        pendingVendors,
        openTickets,
        totalRevenue: revenueAgg._sum.total || 0,
      },
      dailyOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
