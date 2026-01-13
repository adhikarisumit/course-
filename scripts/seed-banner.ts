import prisma from '../lib/prisma';

async function main() {
  // Deactivate all banners first
  await prisma.promoBanner.updateMany({ data: { isActive: false } });

  // Create a new active banner
  await prisma.promoBanner.create({
    data: {
      title: '50% OFF on All Courses!',
      description: 'Limited time offer - Enroll now and save big!',
      badgeText: 'SALE',
      linkUrl: '/courses',
      linkText: 'View Courses',
      backgroundColor: '#ef4444',
      textColor: '#ffffff',
      isActive: true,
      startDate: null,
      endDate: null,
    }
  });

  console.log('Seeded active promo banner.');
}

main().then(() => prisma.$disconnect());
