const express = require('express');
const prisma = require('../../lib/prisma');
const customerAuth = require('../../middleware/customerAuth');

const router = express.Router();

router.use(customerAuth);

/** GET /api/customer/reviews ?boughtOnly= */
router.get('/', async (req, res) => {
  try {
    const where = { userId: req.user.userId };
    if (req.query.boughtOnly === 'true') where.isVerified = true;
    const reviews = await prisma.review.findMany({
      where,
      include: { product: { select: { id: true, name: true, images: { take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/customer/reviews  { productId, rating, title?, body, images? } */
router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.productId) return res.status(400).json({ error: 'productId required.' });
    if (!b.rating || b.rating < 1 || b.rating > 5) return res.status(400).json({ error: 'rating must be 1-5.' });
    if (!b.body) return res.status(400).json({ error: 'body required.' });

    const purchased = await prisma.orderItem.findFirst({
      where: { productId: b.productId, order: { customerId: req.user.userId, status: 'delivered' } },
    });

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user.userId, productId: b.productId } },
      update: { rating: b.rating, title: b.title, body: b.body, images: b.images || [] },
      create: {
        userId: req.user.userId,
        productId: b.productId,
        orderItemId: purchased?.id || null,
        rating: b.rating,
        title: b.title,
        body: b.body,
        images: b.images || [],
        isVerified: Boolean(purchased),
      },
    });
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PUT /api/customer/reviews/:id */
router.put('/:id', async (req, res) => {
  try {
    const r = await prisma.review.updateMany({
      where: { id: req.params.id, userId: req.user.userId },
      data: { rating: req.body?.rating, title: req.body?.title, body: req.body?.body, images: req.body?.images },
    });
    res.json({ ok: r.count > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/customer/reviews/:id */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.review.deleteMany({ where: { id: req.params.id, userId: req.user.userId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;