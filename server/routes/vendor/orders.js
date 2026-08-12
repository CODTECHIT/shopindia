const express = require('express');
const prisma = require('../../lib/prisma');
const { verifyToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

const router = express.Router();
router.use(verifyToken, requireRole('vendor'));

const VENDOR_STATUSES = ['placed', 'confirmed', 'packing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'];

/** GET /api/vendor/orders — FR-02.3: Vendor's orders */
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { vendorId: req.user.vendorId };
    if (status) where.status = status;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true, phone: true } },
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

/** GET /api/vendor/orders/:id */
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, vendorId: req.user.vendorId },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** PATCH /api/vendor/orders/:id/status — FR-02.3: Process/pack/update */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!VENDOR_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${VENDOR_STATUSES.join(', ')}` });
    }
    const existing = await prisma.order.findFirst({
      where: { id: req.params.id, vendorId: req.user.vendorId },
    });
    if (!existing) return res.status(404).json({ error: 'Order not found.' });

    let order;
    if (status === 'delivered' && existing.status !== 'delivered') {
      const vendor = await prisma.vendor.findUnique({ where: { id: req.user.vendorId } });
      const commRateRaw = Number(vendor?.commissionRate) || 10;
      const commRate = commRateRaw > 1 ? commRateRaw / 100 : commRateRaw;
      const commission = existing.total * commRate;
      const netEarnings = existing.total - commission;

      const [updatedOrder] = await prisma.$transaction([
        prisma.order.update({
          where: { id: req.params.id },
          data: {
            status: 'delivered',
            paymentStatus: 'paid',
            commission,
          },
          include: { items: true },
        }),
        prisma.vendor.update({
          where: { id: req.user.vendorId },
          data: {
            walletBalance: { increment: netEarnings }
          }
        })
      ]);
      order = updatedOrder;
    } else {
      order = await prisma.order.update({
        where: { id: req.params.id },
        data: { status },
        include: { items: true },
      });
    }
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
