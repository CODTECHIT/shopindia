const express = require('express');
const prisma  = require('../../lib/prisma');
const { verifyToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

const router = express.Router();
router.use(verifyToken, requireRole('vendor'));

/** GET /api/vendor/wallet — FR-02.5: Earnings dashboard */
router.get('/', async (req, res) => {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: req.user.vendorId },
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found.' });

    const earnings = await prisma.order.aggregate({
      where: { vendorId: req.user.vendorId, paymentStatus: 'paid' },
      _sum: { total: true, commission: true },
      _count: { id: true },
    });

    const grossRevenue = earnings._sum.total || 0;
    const totalCommission = earnings._sum.commission || 0;

    res.json({
      walletBalance:   vendor.walletBalance,
      commissionRate:  vendor.commissionRate,
      grossRevenue,
      totalCommission,
      netEarnings:     grossRevenue - totalCommission,
      orderCount:      earnings._count.id || 0,
      bankDetails: {
        accountHolder: vendor.accountHolder,
        accountNumber: vendor.accountNumber,
        ifsc: vendor.ifsc,
        bankName: vendor.bankName,
      },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** GET /api/vendor/wallet/transactions — recent paid orders as ledger */
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const where = { vendorId: req.user.vendorId, paymentStatus: 'paid' };
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [transactions, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          commission: true,
          createdAt: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ transactions, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** POST /api/vendor/wallet/withdraw — request withdrawal */
router.post('/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;
    const vendor = await prisma.vendor.findUnique({ where: { id: req.user.vendorId } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found.' });
    if (amount <= 0 || amount > vendor.walletBalance) {
      return res.status(400).json({ error: 'Invalid withdrawal amount.' });
    }
    const updated = await prisma.vendor.update({
      where: { id: req.user.vendorId },
      data: { walletBalance: vendor.walletBalance - amount },
    });
    res.json({ message: 'Withdrawal request submitted.', walletBalance: updated.walletBalance });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/** PATCH /api/vendor/wallet/bank-details — update bank account */
router.patch('/bank-details', async (req, res) => {
  try {
    const { accountHolder, accountNumber, ifsc, bankName } = req.body;
    const vendor = await prisma.vendor.update({
      where: { id: req.user.vendorId },
      data: { accountHolder, accountNumber, ifsc, bankName },
    });
    res.json({
      bankDetails: {
        accountHolder: vendor.accountHolder,
        accountNumber: vendor.accountNumber,
        ifsc: vendor.ifsc,
        bankName: vendor.bankName,
      },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
