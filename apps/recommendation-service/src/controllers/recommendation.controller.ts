import { NextFunction, Response } from 'express';
import { recommendedProducts } from '../services/recommendationService';

export const getRecommendedProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id as string;

    const products = await prisma.product.findMany({
      include: {
        images: true,
      },
    });

    let userAnalytics = await prisma.userAnalytics.findFirst({
      where: {
        userId,
      },
      select: {
        actions: true,
        recommendations: true,
        lastVisited: true,
        lastTrained: true,
      },
    });

    const now = new Date();
    let recommendProducts = [];

    if (!userAnalytics) {
      recommendProducts = products.slice(-10);
    } else {
      const actions = Array.isArray(userAnalytics.actions)
        ? (userAnalytics.actions as any[])
        : [];

      const recommendations = Array.isArray(userAnalytics.recommendations)
        ? (userAnalytics.recommendations as string[])
        : [];

      const lastTrainedTime = userAnalytics.lastVisited
        ? new Date(userAnalytics.lastTrained)
        : null;

      const hoursDiff = lastTrainedTime
        ? (now.getTime() - lastTrainedTime.getTime()) / (1000 * 60 * 60)
        : Infinity;

      if (actions.length < 50) {
        recommendProducts = products.slice(-10);
      } else if (hoursDiff < 3 && recommendations.length > 0) {
        recommendProducts = products.filter((product) =>
          recommendations.includes(product.id)
        );
      } else {

        let recommendedProductIds = await recommendedProducts(userId, products);

        // filter products by IDs
        let filteredProducts = products.filter((product) =>
          recommendedProductIds.includes(product.id)
        );

        await prisma.userAnalytics.update({
          where: {
            userId,
          },
          data: {
            recommendations: recommendedProductIds,
            lastTrained: now,
          },
        });

        recommendProducts = filteredProducts;
      }
    }

    res.status(200).json({
      success: true,
      recommendations: recommendProducts,
    });
  } catch (error) {
    next(error);
  }
};
