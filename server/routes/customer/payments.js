const express = require('express');
const prisma = require('../../lib/prisma');
const customerAuth = require('../../middleware/customerAuth');

const router = express.Router();

router.use(customerAuth);

/** GET /api/customer/payments  (methods + transaction history) */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const [methods, transactions] = await Promise.all([
      prisma.paymentMethod.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] }),
      prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    res.json({ methods, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/customer/payments */
router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    const type = b.type; // UPI | CREDIT_CARD | DEBIT_CARD | NET_BANKING
    if (!type) return res.status(400).json({ error: 'type required.' });
    if (type === 'UPI' && !b.upiId) return res.status(400).json({ error: 'upiId required for UPI.' });
    if ((type === 'CREDIT_CARD' || type === 'DEBIT_CARD') && (!b.cardNumber || b.cardNumber.length < 12)) {
      return res.status(400).json({ error: 'Valid cardNumber required.' });
    }
    if (type === 'NET_BANKING' && !b.bankName) return res.status(400).json({ error: 'bankName required.' });

    const { _count } = await prisma.paymentMethod.aggregate({ where: { userId }, _count: true });
    const isDefault = b.isDefault || _count._count === 0;
    if (isDefault) await prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } });

    const method = await prisma.paymentMethod.create({
      data: {
        userId,
        type,
        label: b.label || type.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' '),
        upiId: b.upiId,
        last4: b.cardNumber ? String(b.cardNumber).slice(-4) : undefined,
        cardBrand: b.cardBrand,
        expiry: b.expiry,
        bankName: b.bankName,
        isDefault,
      },
    });
    res.status(201).json({ method });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/customer/payments/:id */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.paymentMethod.deleteMany({ where: { id: req.params.id, userId: req.user.userId } });
    const next = await prisma.paymentMethod.findFirst({ where: { userId: req.user.userId }, orderBy: { createdAt: 'asc' } });
    if (next) await prisma.paymentMethod.update({ where: { id: next.id }, data: { isDefault: true } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/customer/payments/:id/default */
router.post('/:id/default', async (req, res) => {
  try {
    await prisma.paymentMethod.updateMany({ where: { userId: req.user.userId }, data: { isDefault: false } });
    const r = await prisma.paymentMethod.updateMany({
      where: { id: req.params.id, userId: req.user.userId },
      data: { isDefault: true },
    });
    res.json({ ok: r.count > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;