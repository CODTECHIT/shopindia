const express = require('express');
const prisma = require('../../lib/prisma');
const { verifyToken }      = require('../../middleware/auth');
const { requirePermission } = require('../../middleware/rbac');

const router = express.Router();
router.use(verifyToken, requirePermission('manage_support'));

/** GET /api/admin/support/tickets — FR-05.7 */
router.get('/tickets', async (req, res) => {
  try {
    const { status, priority, assignedTo, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status)     where.status       = status;
    if (priority)   where.priority     = priority;
    if (assignedTo) where.assignedToId = assignedTo;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          customer: { select: { name: true, email: true, phone: true } },
          assignedTo: { select: { name: true, email: true } },
          order: { select: { orderNumber: true, total: true } },
          messages: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.ticket.count({ where }),
    ]);
    res.json({ tickets, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** GET /api/admin/support/tickets/:id */
router.get('/tickets/:id', async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        assignedTo: { select: { name: true, email: true } },
        order: true,
        messages: true,
      },
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** PATCH /api/admin/support/tickets/:id/status */
router.patch('/tickets/:id/status', async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const data = { status };
    if (assignedTo) data.assignedToId = assignedTo;
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data,
      include: { messages: true },
    });
    res.json(ticket);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** POST /api/admin/support/tickets/:id/reply */
router.post('/tickets/:id/reply', async (req, res) => {
  try {
    const { text } = req.body;
    await prisma.ticketMessage.create({
      data: {
        ticketId: req.params.id,
        senderRole: 'support',
        text,
        sentAt: new Date(),
      },
    });
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status: 'in_progress' },
      include: { messages: true },
    });
    res.json(ticket);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** POST /api/admin/support/tickets/:id/refund — approve/reject refund */
router.post('/tickets/:id/refund', async (req, res) => {
  try {
    const { refundStatus, refundAmount } = req.body;
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        refundStatus,
        refundAmount,
        status: refundStatus === 'approved' ? 'resolved' : 'in_progress',
      },
    });

    if (refundStatus === 'approved' && ticket.orderId) {
      await prisma.order.update({
        where: { id: ticket.orderId },
        data: {
          refundAmount,
          refundedAt: new Date(),
          paymentStatus: 'refunded',
          status: 'refunded',
        },
      });
    }
    res.json(ticket);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
