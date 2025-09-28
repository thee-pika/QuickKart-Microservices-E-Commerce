import { ValidationError } from '../../../../packages/error-handler';
import { imageKit } from '../../../../packages/libs/imagekit';
import { NextFunction, Request, Response } from 'express';

export const deleteShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const sellerShopId = req.seller.shop.id;

    const shop = await prisma.shops.findFirst({
      where: {
        id: shopId,
      },
      select: {
        id: true,
        sellerId: true,
        isDeleted: true,
      },
    });

    if (!shop) {
      return next(new ValidationError('shop not found!'));
    }

    if (shop.sellerId !== sellerShopId) {
      return next(new ValidationError('Unauthorized action!'));
    }

    if (shop.isDeleted) {
      return next(new ValidationError('shop is already deleted!'));
    }

    const deleteShop = await prisma.shops.update({
      where: {
        id: shopId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        'shop is scheduled for deletion in 24 hrs . you can restore with in 24hrs',
      deletedAt: deleteShop.deletedAt,
    });
  } catch (error) {

    return next(error);
  }
};

export const restoreShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const sellerShopId = req.seller.shop.id;

    const shop = await prisma.shops.findFirst({
      where: {
        id: shopId,
      },
      select: {
        id: true,
        sellerId: true,
        isDeleted: true,
      },
    });

    if (!shop) {
      return next(new ValidationError('shop not found!'));
    }

    if (shop.sellerId !== sellerShopId) {
      return next(new ValidationError('Unauthorized action!'));
    }

    if (!shop.isDeleted) {
      return res.status(400).json({
        message: 'shop is not in deleted state!',
      });
    }

    await prisma.shops.update({
      where: {
        id: shopId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      message: 'shop successfully restored!!',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error restoring the product',
      error,
    });
  }
};

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : req.body?.fileName;
    if (!raw) {
      return res
        .status(400)
        .json({ success: false, message: 'fileName is required' });
    }

    const base64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw;

    const response = await imageKit.upload({
      file: base64,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products',
    });
    res
      .status(201)
      .json({ success: true, file_url: response.url, fileId: response.fileId });
  } catch (error) {
    return next(error);
  }
};

export const updateProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const raw = typeof req.body === 'string' ? req.body : req.body?.fileName;
    if (!raw) {
      return res
        .status(400)
        .json({ success: false, message: 'fileName is required' });
    }

    const base64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw;

    const response = await imageKit.upload({
      file: base64,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products',
    });

    res
      .status(201)
      .json({ success: true, file_url: response.url, fileId: response.fileId });
  } catch (error) {
    return next(error);
  }
};

export const editSellerProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    if (!sellerId) {
    }

    const seller = await prisma.sellers.findFirst({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
    }

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        ...req.body,
      },
    });

    res.status(201).json({
      success: true,
      messsage: 'seller details updated successfully!!',
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerInfo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req.params?.id;

    const seller = await prisma.shops.findFirst({
      where: {
        id: shopId,
      },
      select: {
        sellers: true,
      },
    });

    res.status(201).json({ success: true, seller });
  } catch (error) {
    return next(error);
  }
};

export const getShopDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req.params?.id;

    const shop = await prisma.shops.findFirst({
      where: {
        id: shopId,
      },
      include: {
        avatar: true,
      },
    });

    res.status(201).json({ success: true, shop });
  } catch (error) {
    return next(error);
  }
};

export const getSellerShopDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    const shop = await prisma.shops.findFirst({
      where: {
        sellerId,
      },
      include: {
        avatar: true,
      },
    });

    res.status(201).json({ success: true, shop });
  } catch (error) {
    return next(error);
  }
};

export const getSellerProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req.params?.id;

    const products = await prisma.product.findMany({
      where: {
        shopId,
      },
    });

    res.status(201).json({ success: true, products });
  } catch (error) {
    return next(error);
  }
};

export const getSellerEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventsId = req.params?.id;

    const product = await prisma.product.findFirst({
      where: {
        id: eventsId,
      },
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    return next(error);
  }
};

export const markNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return next(new ValidationError('notificationId not found!!'));
    }

    await prisma.notifications.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Notification updated !!!',
    });
  } catch (error) {
    next(error);
  }
};

export const sellerNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;

    const notifications = await prisma.notifications.findMany({
      where: {
        receivedId: sellerId,
      },
    });

    res.status(201).json({ success: true, notifications });
  } catch (error) {
    return next(error);
  }
};

export const followShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let participantId;
    if (req.role === 'user') {
      participantId = req.user.id;
    } else {
      participantId = req.seller.id;
    }

    const { shopId } = req.body;

    const shop = await prisma.shops.findFirst({
      where: {
        id: shopId,
      },
    });

    if (!shop) {
      return next(new ValidationError('shop not found!'));
    }

    const existingFollow = await prisma.followers.findFirst({
      where: {
        userId: participantId,
        shopsId: shopId,
      },
    });

    if (existingFollow) {
      return next(new ValidationError('Already following this shop!'));
    }

    const newFollow = await prisma.followers.create({
      data: {
        userId: participantId,
        shopsId: shopId,
      },
    });

    await prisma.shops.update({
      where: {
        id: shopId,
      },
      data: {
        followersCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json({ success: true, newFollow });
  } catch (error) {
    return next(error);
  }
};

export const unFollowShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let participantId;
    if (req.role === 'user') {
      participantId = req.user.id;
    } else {
      participantId = req.seller.id;
    }

    const { shopId } = req.body;

    const shop = await prisma.shops.findFirst({
      where: {
        id: shopId,
      },
    });

    if (!shop) {
      return next(new ValidationError('shop not found!'));
    }

    const isFollowing = await prisma.followers.findFirst({
      where: {
        userId: participantId,
        shopsId: shopId,
      },
    });

    if (!isFollowing) {
      return next(
        new ValidationError('youre not following this shop to unfollow!')
      );
    }

    await prisma.followers.deleteMany({
      where: {
        userId: participantId,
        shopsId: shopId,
      },
    });

    await prisma.shops.update({
      where: {
        id: shopId,
      },
      data: {
        followersCount: {
          decrement: 1,
        },
      },
    });

    res.status(200).json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) {

    return next(error);
  }
};

export const isFollowing = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let participantId;

    if (req.role === 'user') {
      participantId = req.user.id;
    } else {
      participantId = req.seller.id;
    }

    const shopId = req.id;

    const shop = await prisma.shops.findFirst({
      where: {
        id: shopId,
      },
    });

    if (!shop) {
      return next(new ValidationError('shop not found!'));
    }

    await prisma.followers.findFirst({
      where: {
        userId: participantId,
        shopsId: shopId,
      },
    });

    if (!isFollowing) {
      return next(new ValidationError('user is not following this shop!'));
    }

    res.status(201).json({ success: true, isFollowing: true });
  } catch (error) {
    return next(error);
  }
};
