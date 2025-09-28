import cron from "node-cron";

cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();

    const deleteProducts = await prisma.product.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lte: now,
        },
      },
    });

    console.log(`${deleteProducts.count} expired products permantely deleted.`);
  } catch (error) {}
});
