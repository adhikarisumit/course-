const { PrismaClient } = require('@prisma/client');

async function checkPurchases() {
  const prisma = new PrismaClient();

  try {
    const purchases = await prisma.resourcePurchase.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resource: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Resource Purchases in database:');
    console.log(JSON.stringify(purchases, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPurchases();