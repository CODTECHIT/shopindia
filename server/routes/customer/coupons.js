const express = require('express');
const prisma = require('../../lib/prisma');
const customerAuth = require('../../middleware/customerAuth');

const router = express.Router();

router.use(customerAuth);

/** GET /api/customer/coupons — available (grouped by validity) + rewards summary */
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({ where: { isActive: true }, orderBy: { validUntil: 'asc' } });
    const usedCodes = await prisma.order.findMany({
      where: { customerId: req.user.userId, couponId: { not: null } },
      select: { couponId: true },
    });
    const usedSet = new Set(usedCodes.map((o) => o.couponId));

    const available = coupons.filter((c) => c.validUntil > now && !usedSet.has(c.id));
    const used = coupons.filter((c) => usedSet.has(c.id));
    const expired = coupons.filter((c) => c.validUntil <= now);

    const rewards = await prisma.reward.findMany({ where: { userId: req.user.userId }, orderBy: { createdAt: 'desc' } });
    const points = rewards.reduce((s, r) => s + (r.expiresAt && r.expiresAt < now ? 0 : r.points), 0);

    res.json({ coupons: { available, used, expired }, rewards, points });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;