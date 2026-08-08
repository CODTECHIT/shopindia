const express = require('express');
const prisma = require('../../lib/prisma');
const customerAuth = require('../../middleware/customerAuth');

const router = express.Router();

router.use(customerAuth);

/** GET /api/customer/cart */
router.get('/', async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: { product: { include: { images: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PUT /api/customer/cart  { items: [{ productId, quantity, savedForLater }] } */
router.put('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });

    const items = req.body?.items || [];
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (items.length) {
      await prisma.cartItem.createMany({
        data: items.map((it) => ({
          cartId: cart.id,
          userId,
          productId: it.productId,
          quantity: Math.max(1, Number(it.quantity) || 1),
          savedForLater: Boolean(it.savedForLater),
        })),
      });
    }
    const result = await prisma.cartItem.findMany({ where: { cartId: cart.id }, include: { product: true } });
    res.json({ items: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/customer/cart/:productId  { quantity?, savedForLater? } */
router.patch('/:productId', async (req, res) => {
  try {
    const data = {};
    if (req.body?.quantity != null) data.quantity = Math.max(1, Number(req.body.quantity));
    if (req.body?.savedForLater != null) data.savedForLater = Boolean(req.body.savedForLater);
    const res2 = await prisma.cartItem.updateMany({
      where: { userId: req.user.userId, productId: req.params.productId },
      data,
    });
    res.json({ ok: res2.count > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/customer/cart/:productId */
router.delete('/:productId', async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.userId, productId: req.params.productId } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;