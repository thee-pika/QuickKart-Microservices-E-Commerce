import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthError, ValidationError } from '../../../../packages/error-handler';
import { imageKit } from '../../../../packages/libs/imagekit';

export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('All Fields are required!'));
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (!existingUser) {
      return next(new AuthError("User doesn't exists with this email!"));
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password as string
    );

    if (!isPasswordValid) {
      return next(new AuthError('Invalid Credentials'));
    }

    if (existingUser.role !== 'admin') {
      return next(new AuthError('Invalid Access'));
    }

    const accessToken = jwt.sign(
      { id: existingUser.id, role: 'admin' },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: '1h',
      }
    );

    const refreshToken = jwt.sign(
      { id: existingUser.id, role: 'admin' },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: '7d',
      }
    );

    res.status(200).json({
      success: true,
      message: 'Admin Logined  Successful!!',
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const getLoggedInAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        id: req.admin.id,
      },
      include: {
        avatar: true,
      },
    });

    res.status(200).json({ success: true, admin });
  } catch (error) {
    return next(error);
  }
};

export const getAllSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellers = await prisma.sellers.findMany();
    res.status(200).json({
      success: true,
      sellers,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdminNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        receivedId: 'admin',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        receivedId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_Codes = await prisma.discount_Codes.findMany();

    return res.status(200).json({
      success: true,
      discount_Codes,
    });
  } catch (error) {
    return next(error);
  }
};

export const addTitle = async (req: any, res: Response, next: NextFunction) => {
  try {
    const discount_Codes = await prisma.discount_Codes.findMany();

    return res.status(200).json({
      success: true,
      discount_Codes,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany();

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
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

export const getAllProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllStats = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.count();
    const users = await prisma.user.count();
    const sellers = await prisma.sellers.count();
    const offers = await prisma.discount_Codes.count();

    const orders = await prisma.orders.findMany({
      select: {
        id: true,
        createdAt: true,
        status: true,
      },
    });

    res.status(200).json({
      success: true,
      products,
      users,
      sellers,
      offers,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const baseFilter = {
      AND: [
        {
          startingDate: {
            not: null,
          },
        },
        {
          endingDate: {
            not: null,
          },
        },
      ],
    };

    const products = await prisma.product.findMany({
      where: baseFilter,
    });

    res.status(200).json({
      success: true,
      events: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAdmins = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin',
      },
    });

    res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    next(error);
  }
};

export const addNewAdmin = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'user',
      },
    });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomizations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const customizations = await prisma.customizations.findFirst();

    res.status(200).json({
      success: true,
      customizations,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomizationBrandName = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { value } = req.body;
    const customization = await prisma.customizations.update({
      where: {
        id: req.admin.id,
      },
      data: {
        brandName: value,
      },
    });

    res.status(200).json({
      success: true,
      message: 'customization updated.',
      customization,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLogoOrBanner = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { field, fileName } = req.body;
    const userId = req.admin.id;

    if (!field || !['logo', 'banner'].includes(field)) {
      res.status(400).json({ success: false, message: 'Invalid field' });
      return;
    }

    if (!fileName) {
      res.status(400).json({ success: false, message: 'fileName is required' });
      return;
    }

    const base64 = fileName.includes('base64,')
      ? fileName.split('base64,')[1]
      : fileName;

    const response = await imageKit.upload({
      file: base64,
      fileName: `custom-${Date.now()}.jpg`,
      folder: '/admin',
    });

    let customization = await prisma.customizations.findUnique({
      where: { userId },
    });

    if (!customization) {
      const data: any = { userId };
      if (field === 'logo') {
        data.logoUrl = response.url;
        data.logoFileId = response.fileId;
      } else {
        data.bannerUrl = response.url;
        data.bannerFileId = response.fileId;
      }

      customization = await prisma.customizations.create({
        data,
      });
    } else {
      const updateData: any = {};
      if (field === 'logo') {
        updateData.logoUrl = response.url;
        updateData.logoFileId = response.fileId;
      } else {
        updateData.bannerUrl = response.url;
        updateData.bannerFileId = response.fileId;
      }

      customization = await prisma.customizations.update({
        where: { userId },
        data: updateData,
      });
    }

    res.status(200).json({
      success: true,
      customization,
    });
  } catch (error) {
    next(error);
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
      fileName: `custom-${Date.now()}.jpg`,
      folder: '/admin',
    });

    res
      .status(201)
      .json({ success: true, file_url: response.url, fileId: response.fileId });
  } catch (error) {
    return next(error);
  }
};

export const updateAvatar = async (
  req: any,
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
      fileName: `custom-${Date.now()}.jpg`,
      folder: '/admin',
    });

    await prisma.user.update({
      where: {
        id: req?.admin?.id,
      },
      data: {
        avatar: {
          create: {
            file_url: response.url,
            fileId: response.fileId,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'user avatar updated successfully!!',
      file_url: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    await prisma.user.update({
      where: {
        id: req.admin.id,
      },
      data: req.body,
    });

    res
      .status(201)
      .json({ success: true, message: 'user details updated successfully!!' });
  } catch (error) {
    return next(error);
  }
};
