/**
 * Seed script — creates system roles + super_admin + demo vendor in PostgreSQL via Prisma.
 * Run: node server/scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const SYSTEM_ROLES = [
  {
    name: 'super_admin', displayName: 'Super Admin', isSystem: true,
    permissions: [],
  },
  {
    name: 'branch_manager', displayName: 'Branch Manager', isSystem: true,
    permissions: ['manage_orders', 'view_orders', 'manage_support', 'view_support', 'view_dashboard', 'view_vendors', 'view_users'],
  },
  {
    name: 'support_exec', displayName: 'Support Executive', isSystem: true,
    permissions: ['manage_support', 'view_support', 'view_orders'],
  },
];

async function seed() {
  console.log('✅ Connecting to RDS PostgreSQL via Prisma...');

  // Upsert system roles
  for (const r of SYSTEM_ROLES) {
    const existing = await prisma.role.findUnique({ where: { name: r.name } });
    if (!existing) {
      await prisma.role.create({
        data: {
          name: r.name,
          displayName: r.displayName,
          isSystem: r.isSystem,
          permissions: r.permissions.length
            ? { create: r.permissions.map((p) => ({ permission: p })) }
            : undefined,
        },
      });
      console.log(`  Created Role: ${r.name}`);
    }
  }

  // Super Admin user
  const adminEmail = 'admin@shopindia.in';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);
    admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        phone: '9999999999',
        password: hashedPassword,
        role: 'super_admin',
        permissions: [],
      },
    });
    console.log('  Created Admin user: admin@shopindia.in / Admin@1234');
  } else {
    console.log('  Admin user already exists — skipping.');
  }

  // Sample approved vendor
  const vendorEmail = 'vendor@demo.in';
  let vendorUser = await prisma.user.findUnique({ where: { email: vendorEmail } });
  if (!vendorUser) {
    const hashedPassword = await bcrypt.hash('Vendor@1234', 10);
    vendorUser = await prisma.user.create({
      data: {
        name: 'Demo Vendor',
        email: vendorEmail,
        phone: '8888888888',
        password: hashedPassword,
        role: 'vendor',
      },
    });

    const vendor = await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        businessName: 'Demo Electronics',
        contactName: 'Demo Vendor',
        email: vendorEmail,
        phone: '8888888888',
        gstNumber: '29ABCDE1234F1Z5',
        approvalStatus: 'approved',
        commissionRate: 10,
        walletBalance: 0,
      },
    });

    await prisma.user.update({
      where: { id: vendorUser.id },
      data: { vendorId: vendor.id },
    });
    console.log('  Created Vendor: vendor@demo.in / Vendor@1234');
  }

  await prisma.$disconnect();
  console.log('✅ Seed complete.');
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
