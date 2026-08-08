const express = require('express');
const prisma = require('../../lib/prisma');
const customerAuth = require('../../middleware/customerAuth');

const router = express.Router();

router.use(customerAuth);

/** GET /api/customer/wishlist */
router.get('/', async (req, res) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.userId },
      include: { product: { include: { images: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/customer/wishlist  { productId, priceDropAlert? } */
router.post('/', async (req, res) => {
  try {
    const { productId, priceDropAlert } = req.body || {};
    if (!productId) return res.status(400).json({ error: 'productId required.' });
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId: req.user.userId } });
    }
    const item = await prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      update: { priceDropAlert: Boolean(priceDropAlert) },
      create: { wishlistId: wishlist.id, userId: req.user.userId, productId, priceDropAlert: Boolean(priceDropAlert) },
    });
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/customer/wishlist/:productId */
router.delete('/:productId', async (req, res) => {
  try {
    await prisma.wishlistItem.deleteMany({ where: { userId: req.user.userId, productId: req.params.productId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/customer/wishlist/:productId  { priceDropAlert } */
router.patch('/:productId', async (req, res) => {
  try {
    const item = await prisma.wishlistItem.updateMany({
      where: { userId: req.user.userId, productId: req.params.productId },
      data: { priceDropAlert: Boolean(req.body?.priceDropAlert) },
    });
    res.json({ ok: item.count > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
