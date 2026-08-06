const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

/** GET /api/categories — public storefront categories (active only) */
router.get('/', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        vertical: true,
        image: true,
        sortOrder: true,
        _count: { select: { products: true } },
      },
      orderBy: [{ vertical: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;