const express = require('express');
const router = express.Router();
const prisma = require('../../lib/prisma');
const { verifyToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');

router.use(verifyToken);
router.use(requireRole('super_admin', 'branch_manager'));

// Get all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Create new coupon
router.post('/', async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, validUntil, usageLimit } = req.body;
    
    // Check if code exists
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) return res.status(400).json({ error: 'Coupon code already exists' });

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        validUntil: new Date(validUntil),
        usageLimit: Number(usageLimit || 0)
      }
    });

    res.json({ coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Toggle status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const coupon = await prisma.coupon.findUnique({ where: { id: req.params.id } });
    if (!coupon) return res.status(404).json({ error: 'Not found' });

    await prisma.coupon.update({
      where: { id: req.params.id },
      data: { isActive: !coupon.isActive }
    });
    res.json({ message: 'Toggled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle' });
  }
});

module.exports = router;
