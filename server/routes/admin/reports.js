const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

router.use(verifyToken);
router.use(requireRole('super_admin', 'branch_manager'));
// Require view_dashboard or new manage_reports permission
// router.use(requirePermission(['view_dashboard'])); 

router.get('/sales', async (req, res) => {
  try {
    const { branchId, startDate, endDate, period = '30d' } = req.query;
    
    let since;
    let until = new Date();

    if (startDate || endDate) {
      since = startDate ? new Date(startDate) : new Date(0);
      if (endDate) {
        until = new Date(endDate);
        until.setHours(23, 59, 59, 999);
      }
    } else {
      const msMap = {
        '7d': 7,
        'monthly': 30,
        '30d': 30,
        '90d': 90,
        '6months': 180,
        '12months': 365,
        'yearly': 365
      };
      const days = msMap[period] || 30;
      since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    const where = {};
    if (branchId) where.branchId = branchId;
    where.createdAt = { gte: since, lte: until };

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        createdAt: true,
        branch: { select: { name: true } },
        vendor: { select: { businessName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 500
    });

    res.json({ orders });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// CSV Export
router.get('/export', async (req, res) => {
  try {
    const { branchId, startDate, endDate, period } = req.query;
    const where = {};
    if (branchId) where.branchId = branchId;

    let since;
    let until = new Date();

    if (startDate || endDate) {
      since = startDate ? new Date(startDate) : new Date(0);
      if (endDate) {
        until = new Date(endDate);
        until.setHours(23, 59, 59, 999);
      }
    } else if (period) {
      const msMap = {
        '7d': 7,
        'monthly': 30,
        '30d': 30,
        '90d': 90,
        '6months': 180,
        '12months': 365,
        'yearly': 365
      };
      const days = msMap[period] || 30;
      since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    if (since) {
      where.createdAt = { gte: since, lte: until };
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        orderNumber: true,
        total: true,
        discount: true,
        commission: true,
        createdAt: true,
        status: true,
        customer: { select: { name: true, email: true } },
        branch: { select: { name: true } },
        vendor: { select: { businessName: true } }
      }
    });

    const csvData = orders.map(o => ({
      Order_ID: o.orderNumber,
      Date: o.createdAt.toISOString().split('T')[0],
      Customer: o.customer?.name || 'N/A',
      Customer_Email: o.customer?.email || 'N/A',
      Vendor: o.vendor?.businessName || 'N/A',
      Branch: o.branch?.name || 'Online',
      Amount: o.total || 0,
      Platform_Commission: o.commission || 0,
      Status: o.status
    }));

    res.json({ data: csvData });
  } catch (error) {
    console.error('Error generating export:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
