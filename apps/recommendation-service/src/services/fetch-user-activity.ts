import { prisma } from '../../../../packages/libs/prisma';

export const getUserActivity = async (userId: string) => {
  try {
    const useractivity = await prisma.userAnalytics.findFirst({
      where: {
        userId,
      },
      select: {
        actions: true,
      },
    });

    return useractivity?.actions || [];
  } catch (error) {
    return [];
  }
};
