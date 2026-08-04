const express = require('express');
const router = express.Router();
const prisma = require('../../../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../../../middleware/auth');

router.use(requireAuth);
router.use(requireRole(['super_admin', 'branch_manager']));
// Require view_dashboard or new manage_reports permission
// router.use(requirePermission(['view_dashboard'])); 

router.get('/sales', async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;
    
    const where = {};
    if (branchId) where.branchId = branchId;
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

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
      take: 500 // Limit for standard view
    });

    res.json({ orders });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// CSV Export (simplified logic to return JSON that UI converts to CSV)
router.get('/export', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'delivered' },
      select: {
        orderNumber: true,
        total: true,
        discount: true,
        commission: true,
        createdAt: true,
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
      Platform_Commission: o.commission || 0
    }));

    res.json({ data: csvData });
  } catch (error) {
    console.error('Error generating export:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;
