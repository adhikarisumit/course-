const { PrismaClient } = require('@prisma/client');

async function checkAdSettings() {
  const prisma = new PrismaClient();

  try {
    // Use raw query to avoid schema mismatch
    const result = await prisma.$queryRaw`SELECT * FROM "AdSettings" LIMIT 1`;
    console.log('Current AdSettings (raw query):');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error fetching ad settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdSettings();