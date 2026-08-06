const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const router = express.Router();

function mapType(vertical) {
  switch (vertical) {
    case 'quick': return 'quick_commerce';
    case 'services': return 'hvac_service';
    default: return 'traditional';
  }
}

async function getGuestCustomer() {
  const email = 'guest@shopindia.local';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const hashedPassword = await bcrypt.hash('guest-not-login', 10);
    user = await prisma.user.create({
      data: {
        name: 'Guest Customer',
        email,
        password: hashedPassword,
        role: 'customer',
      },
    });
  }
  return user;
}

/** POST /api/orders — place a storefront order */
router.post('/', async (req, res) => {
  try {
    const { items, vertical, location, paymentMethod } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }
    for (const it of items) {
      if (!it.productId || !it.name || !Number.isInteger(it.quantity) || it.quantity < 1) {
        return res.status(400).json({ error: 'Invalid item in order.' });
      }
    }

    // Resolve prices from the database (never trust client-sent prices)
    const productIds = items.map((it) => it.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'active' },
      select: { id: true, basePrice: true, vendorId: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const resolved = [];
    for (const it of items) {
      const product = productMap.get(it.productId);
      if (!product) {
        return res.status(400).json({ error: `Unknown product: ${it.name}` });
      }
      resolved.push({
        productId: product.id,
        vendorId: product.vendorId,
        name: it.name,
        price: product.basePrice,
        quantity: it.quantity,
      });
    }

    const guest = await getGuestCustomer();

    const subtotal = resolved.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const discount = 0;
    const total = subtotal - discount;
    const orderNumber = 'OD-' + Date.now().toString(36).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: guest.id,
        type: mapType(vertical),
        status: 'placed',
        subtotal,
        discount,
        commission: 0,
        total,
        paymentMethod: paymentMethod || 'COD',
        paymentStatus: 'pending',
        deliveryLine1: location || '',
        items: {
          create: resolved.map((it) => ({
            productId: it.productId,
            vendorId: it.vendorId,
            name: it.name,
            price: it.price,
            quantity: it.quantity,
          })),
        },
      },
      include: { items: true },
    });

    await Promise.all(
      resolved.map((it) =>
        prisma.product.updateMany({
          where: { id: it.productId, stock: { gte: it.quantity } },
          data: { stock: { decrement: it.quantity } },
        })
      )
    );

    res.status(201).json({
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;