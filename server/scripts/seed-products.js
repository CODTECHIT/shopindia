/**
 * Seed script — creates a demo vendor + storefront products in PostgreSQL via Prisma.
 * Run: node server/scripts/seed-products.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const prisma = require('../lib/prisma');

const PRODUCTS = [
  // ── Quick commerce ──
  { name: 'Fresh Apples 1kg', brand: 'Farm Fresh', basePrice: 120, mrp: 150, stock: 200, category: 'Fruits & Veggies', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'quick_commerce', ratingAvg: 4.5, ratingCount: 820 },
  { name: 'Organic Bananas 1 dozen', brand: 'Farm Fresh', basePrice: 60, mrp: 80, stock: 300, category: 'Fruits & Veggies', img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'quick_commerce', ratingAvg: 4.4, ratingCount: 540 },
  { name: 'Amul Taaza Milk 1L', brand: 'Amul', basePrice: 66, mrp: 70, stock: 500, category: 'Dairy, Bread & Eggs', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'quick_commerce', ratingAvg: 4.6, ratingCount: 1300 },
  { name: 'Farm Eggs 12 pack', brand: 'Farm Fresh', basePrice: 90, mrp: 100, stock: 250, category: 'Dairy, Bread & Eggs', img: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'quick_commerce', ratingAvg: 4.3, ratingCount: 610 },
  { name: 'Lays Classic Salted 52g', brand: 'Lays', basePrice: 20, mrp: 25, stock: 1000, category: 'Snacks & Munchies', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'quick_commerce', ratingAvg: 4.2, ratingCount: 2200 },
  { name: 'Cold Coffee 250ml', brand: 'Bru', basePrice: 80, mrp: 90, stock: 400, category: 'Cold Drinks & Juices', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'quick_commerce', ratingAvg: 4.5, ratingCount: 950 },

  // ── Traditional shop ──
  { name: 'Samsung 1.5T Split AC', brand: 'Samsung', basePrice: 34999, mrp: 39999, stock: 25, category: 'Appliances', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'traditional', ratingAvg: 4.7, ratingCount: 310 },
  { name: 'Apple iPhone 15 128GB', brand: 'Apple', basePrice: 65900, mrp: 69900, stock: 40, category: 'Mobiles & Tablets', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'traditional', ratingAvg: 4.8, ratingCount: 1200 },
  { name: "Levi's Denim Jacket", brand: 'Levis', basePrice: 1999, mrp: 2499, stock: 80, category: 'Fashion & Apparel', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'traditional', ratingAvg: 4.3, ratingCount: 440 },
  { name: 'Philips Mixer Grinder 750W', brand: 'Philips', basePrice: 2799, mrp: 3299, stock: 60, category: 'Appliances', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'traditional', ratingAvg: 4.4, ratingCount: 700 },
  { name: 'Wooden Study Table', brand: 'Urbanwood', basePrice: 5499, mrp: 6999, stock: 30, category: 'Home & Furniture', img: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'traditional', ratingAvg: 4.2, ratingCount: 210 },

  // ── Services ──
  { name: 'AC Deep Cleaning Service', brand: 'ShopIndia Services', basePrice: 799, mrp: 999, stock: 999, category: 'Services', img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'hvac_service', ratingAvg: 4.6, ratingCount: 180 },
  { name: 'AC Gas Refill Service', brand: 'ShopIndia Services', basePrice: 1499, mrp: 1999, stock: 999, category: 'Services', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&auto=format&fit=crop&q=60', fulfillmentType: 'hvac_service', ratingAvg: 4.5, ratingCount: 140 },
];

async function getOrCreateVendor() {
  const vendorUser = await prisma.user.findUnique({ where: { email: 'vendor@demo.in' } });
  if (vendorUser && vendorUser.vendorId) {
    return prisma.vendor.findUnique({ where: { id: vendorUser.vendorId } });
  }

  const hashedPassword = await require('bcryptjs').hash('Vendor@1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'vendor@demo.in' },
    update: {},
    create: {
      name: 'Demo Vendor',
      email: 'vendor@demo.in',
      phone: '8888888888',
      password: hashedPassword,
      role: 'vendor',
    },
  });

  const vendor = await prisma.vendor.create({
    data: {
      userId: user.id,
      businessName: 'ShopIndia Demo Store',
      contactName: 'Demo Vendor',
      email: 'vendor@demo.in',
      phone: '8888888888',
      gstNumber: '29ABCDE1234F1Z5',
      approvalStatus: 'approved',
      commissionRate: 10,
      walletBalance: 0,
      category: 'General Store',
      description: 'Demo catalog vendor for the ShopIndia storefront.',
    },
  });
  await prisma.user.update({ where: { id: user.id }, data: { vendorId: vendor.id } });
  return vendor;
}

async function seed() {
  console.log('✅ Connecting to RDS PostgreSQL via Prisma...');

  const existingCount = await prisma.product.count();
  if (existingCount > 0) {
    console.log(`  ${existingCount} products already exist — skipping. (delete them first to reseed)`);
    await prisma.$disconnect();
    return;
  }

  const vendor = await getOrCreateVendor();
  console.log(`  Using vendor: ${vendor.businessName}`);

  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name: p.name,
        description: `${p.brand} — available on ShopIndia. Genuine product with fast delivery.`,
        brand: p.brand,
        basePrice: p.basePrice,
        mrp: p.mrp,
        stock: p.stock,
        unit: 'piece',
        isOutOfStock: false,
        fulfillmentType: p.fulfillmentType,
        status: 'active',
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        tags: [p.category],
        images: { create: [{ url: p.img, displayOrder: 0 }] },
      },
    });
    console.log(`  + ${p.name}`);
  }

  await prisma.$disconnect();
  console.log('✅ Product seed complete.');
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
