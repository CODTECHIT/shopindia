/**
 * Sync and normalize category verticals in PostgreSQL so they match the sub-vertical modules:
 * quick_grocery, quick_food, quick_pharmacy, services_home, services_vehicle, shop
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const prisma = require('../lib/prisma');

async function syncCategories() {
  console.log('🔄 Syncing and normalizing category verticals in PostgreSQL...');
  
  const allCats = await prisma.category.findMany();
  console.log(`Found ${allCats.length} categories.`);

  for (const c of allCats) {
    const name = c.name.toLowerCase();
    let newVertical = c.vertical;

    if (name.includes('painting')) {
      newVertical = 'services_home';
    } else if (name.includes('biryani') || name.includes('pizza') || name.includes('thali') || name.includes('curry') || name.includes('dessert') || name.includes('instant food') || name.includes('burger') || name.includes('bowl')) {
      newVertical = 'quick_food';
    } else if (name.includes('fever') || name.includes('pain') || name.includes('cough') || name.includes('cold') || name.includes('vitamin') || name.includes('immunity') || name.includes('first aid') || name.includes('pharma') || name.includes('medicine') || name.includes('dfasdf')) {
      newVertical = 'quick_pharmacy';
    } else if (name.includes('fruit') || name.includes('veggie') || name.includes('dairy') || name.includes('bread') || name.includes('egg') || name.includes('snack') || name.includes('munchies') || name.includes('grocery')) {
      newVertical = 'quick_grocery';
    } else if (name.includes('periodic') || name.includes('car') || name.includes('bike') || name.includes('towing') || name.includes('foam wash') || name.includes('battery') || name.includes('tyre') || name.includes('vehicle')) {
      newVertical = 'services_vehicle';
    } else if (name.includes('ac repair') || name.includes('cleaning') || name.includes('electrician') || name.includes('plumber') || name.includes('salon') || name.includes('appliance repair') || name.includes('painting & decor')) {
      newVertical = 'services_home';
    } else {
      newVertical = 'shop';
    }

    if (newVertical !== c.vertical) {
      await prisma.category.update({
        where: { id: c.id },
        data: { vertical: newVertical }
      });
      console.log(`  ~ Updated "${c.name}": "${c.vertical}" -> "${newVertical}"`);
    } else {
      console.log(`  ✓ "${c.name}" already "${c.vertical}"`);
    }
  }

  await prisma.$disconnect();
  console.log('✅ Categories synchronized successfully.');
}

syncCategories().catch(err => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
