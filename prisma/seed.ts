import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adtracker.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@adtracker.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Ad Accounts
  const accounts = await Promise.all(
    ['บัญชี A', 'บัญชี B', 'บัญชี C'].map(name =>
      prisma.adAccount.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Products
  const products = [
    { name: 'เซรั่มหน้าใส', cost: 120, price: 590, stock: 200 },
    { name: 'ครีมกันแดด SPF50', cost: 85, price: 390, stock: 150 },
    { name: 'คอลลาเจนผง', cost: 200, price: 890, stock: 100 },
  ];

  const createdProducts = [];
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { id: products.indexOf(p) + 1 },
      update: {},
      create: p,
    });
    createdProducts.push(product);
  }

  // Daily Targets
  await prisma.dailyTarget.upsert({
    where: { id: 1 },
    update: {},
    create: {
      profit: 10000,
      adPercent: 15,
      closeRate: 20,
      costPerClick: 50,
    },
  });

  // Sample entries
  const entries = [
    { date: new Date('2025-03-01'), accountId: accounts[0].id, productId: createdProducts[0].id, adCost: 5000, messages: 120, closed: 18, orders: 15, salesFromPage: 45000, quantity: 18, shippingCost: 900, packingCost: 360, adminCommission: 2250, crmSales: 12000, crmQty: 8 },
    { date: new Date('2025-03-02'), accountId: accounts[1].id, productId: createdProducts[1].id, adCost: 3500, messages: 85, closed: 12, orders: 10, salesFromPage: 28000, quantity: 12, shippingCost: 600, packingCost: 240, adminCommission: 1400, crmSales: 8500, crmQty: 5 },
    { date: new Date('2025-03-03'), accountId: accounts[0].id, productId: createdProducts[2].id, adCost: 4200, messages: 95, closed: 15, orders: 12, salesFromPage: 38000, quantity: 15, shippingCost: 750, packingCost: 300, adminCommission: 1900, crmSales: 0, crmQty: 0 },
  ];

  for (const entry of entries) {
    await prisma.entry.create({
      data: {
        ...entry,
        createdById: admin.id,
      },
    });
  }

  console.log('Seed completed: 1 admin, 3 accounts, 3 products, 1 target, 3 entries');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
