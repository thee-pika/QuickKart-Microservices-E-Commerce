import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initializeConfig = async () => {
  try {
    const existingConfig = await prisma.site_Config.create({
      data: {
        categories: [
          'Electronics',
          'Fashion',
          'Home & Kitchen',
          'Sports & Fitness',
        ],
        subCategories: {
          Electronics: ['Mobiles', 'Laptops', 'Gaming', 'Accessories'],
          Fashion: ['Clothing', 'Footwear', 'Women', 'Men', 'Kids Wear'],
          'Home & Kitchen': ['Furniture', 'Appliances', 'Decor'],
          'Sports & Fitness': ['Gym Equipment', 'Sportswear', 'Outdoor'],
        },
      },
    });
  } catch (error) {}
};

export default initializeConfig;


