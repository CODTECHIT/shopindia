const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

/** GET /api/products — public storefront catalog */
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active' },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        vendor: { select: { businessName: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products.map((p) => ({
      id: p.id,
      title: p.name,
      description: p.description || '',
      price: p.basePrice,
      originalPrice: p.mrp || p.basePrice,
      rating: p.ratingAvg,
      ratingCount: p.ratingCount,
      image: p.images && p.images.length ? p.images[0].url : '',
      category: p.tags && p.tags.length ? p.tags[0] : (p.vendor && p.vendor.category ? p.vendor.category : ''),
      brand: p.brand || '',
      vertical: mapVertical(p.fulfillmentType),
      isAssured: false,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mapVertical(fulfillmentType) {
  switch (fulfillmentType) {
    case 'quick_commerce': return 'quick';
    case 'hvac':
    case 'hvac_service': return 'services';
    default: return 'shop';
  }
}

module.exports = router;
