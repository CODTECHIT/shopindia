/**
 * Sync and update existing orders in PostgreSQL so their type accurately reflects:
 * - 'quick_commerce' (for food, grocery, pharmacy, biryani, pizza, etc.)
 * - 'hvac_service' (for ac, cleaning, vehicle repair, wash, towing, salon, etc.)
 * - 'traditional' (for mobiles, laptops, electronics, toys, apparel, etc.)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const prisma = require('../lib/prisma');

async function syncOrderTypes() {
  console.log('🔄 Syncing and normalizing order types in PostgreSQL...');
  
  const allOrders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });

  console.log(`Found ${allOrders.length} orders to inspect.`);

  for (const o of allOrders) {
    const firstCat = o.items?.[0]?.product?.category;
    const catV = (firstCat?.vertical || '').toLowerCase();
    const catN = (firstCat?.name || '').toLowerCase();
    const itemNames = (o.items?.map(it => it.name).join(' ') || '').toLowerCase();

    let newType = 'traditional';

    if (catV.startsWith('quick') || catN.includes('food') || catN.includes('grocery') || catN.includes('biryani') || itemNames.includes('biryani') || itemNames.includes('pizza') || itemNames.includes('sdf') || itemNames.includes('thali') || itemNames.includes('spray')) {
      newType = 'quick_commerce';
    } else if (catV.startsWith('services') || catN.includes('repair') || catN.includes('service') || catN.includes('cleaning') || itemNames.includes('ac') || itemNames.includes('cleaning') || itemNames.includes('towing') || itemNames.includes('repair')) {
      newType = 'hvac_service';
    } else {
      newType = 'traditional';
    }

    if (newType !== o.type) {
      await prisma.order.update({
        where: { id: o.id },
        data: { type: newType }
      });
      console.log(`  ~ Updated Order #${o.orderNumber || o.id} ("${itemNames}"): "${o.type}" -> "${newType}"`);
    } else {
      console.log(`  ✓ Order #${o.orderNumber || o.id} ("${itemNames}") already "${o.type}"`);
    }
  }

  await prisma.$disconnect();
  console.log('✅ Orders synchronized successfully.');
}

syncOrderTypes().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
