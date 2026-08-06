const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@opportunityapp.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.create({
      data: {
        fullName: 'Super Admin',
        email: adminEmail,
        passwordHash,
        isSuperAdmin: true,
      },
    });
    console.log(`Super Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('Super Admin already exists, skipping.');
  }

  const disabilityTypes = ['Visual Impairment', 'Hearing Impairment', 'Locomotor Disability', 'Speech Disability', 'Intellectual Disability'];
  for (const name of disabilityTypes) {
    await prisma.disabilityType.upsert({ where: { name }, update: {}, create: { name } });
  }

  const categories = ['Data Entry', 'Customer Support', 'Graphic Design', 'Content Writing', 'Software Development', 'Teaching / Tutoring'];
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log('Master data seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
