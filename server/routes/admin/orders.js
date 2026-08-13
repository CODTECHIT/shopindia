const express = require('express');
const prisma = require('../../lib/prisma');
const { verifyToken }      = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');

const router = express.Router();
router.use(verifyToken, requirePermission('manage_orders'));

/** GET /api/admin/orders — FR-05.3: Monitor all orders */
router.get('/', async (req, res) => {
  try {
    const { status, type, vendorId, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status)   where.status   = status;
    if (type)     where.type     = type;
    if (vendorId) where.vendorId = vendorId;

    // Data isolation for Branch Managers
    if (req.user.role === 'branch_manager' && req.user.branchId) {
      where.branchId = req.user.branchId;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true, phone: true } },
          vendor: { select: { businessName: true } },
          branch: { select: { name: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** GET /api/admin/orders/:id */
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        vendor: { select: { businessName: true, phone: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** PATCH /api/admin/orders/:id/status */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** POST /api/admin/orders/:id/refund — FR-05.3: Process refunds */
router.post('/:id/refund', async (req, res) => {
  try {
    const { refundAmount, refundReason } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        refundAmount,
        refundReason,
        refundedAt:    new Date(),
        paymentStatus: 'refunded',
        status:        'refunded',
      },
    });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
