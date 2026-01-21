import prisma from '../lib/prisma'

async function main() {
  const deleted = await prisma.resourcePurchase.deleteMany({
    where: { status: 'rejected' }
  })
  console.log('Deleted rejected purchases:', deleted.count)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
