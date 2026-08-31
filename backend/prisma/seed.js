const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const CITIES_BY_STATE = require('./seedData/indiaCities');

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

  const INDIA_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  ];

  for (const name of INDIA_STATES) {
    await prisma.state.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log('States seeded.');
  let citiesCreated = 0;
  for (const [stateName, cityNames] of Object.entries(CITIES_BY_STATE)) {
    const state = await prisma.state.findUnique({ where: { name: stateName } });
    if (!state) {
      // Guards against a typo'd key in indiaCities.js silently seeding nothing
      console.warn(`[seed] No State found matching "${stateName}" — skipping its cities`);
      continue;
    }

    for (const cityName of cityNames) {
      await prisma.city.upsert({
        where: { stateId_name: { stateId: state.id, name: cityName } },
        update: {},
        create: { name: cityName, stateId: state.id },
      });
      citiesCreated += 1;
    }
  }
  console.log(`Cities seeded: ${citiesCreated} across ${Object.keys(CITIES_BY_STATE).length} states/UTs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
