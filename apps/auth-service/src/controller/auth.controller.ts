import { NextFunction, Request, Response } from 'express';
import {
  checkOtpRestrications,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from '../utils/auth.helper';
import { prisma } from '../../../../packages/libs/prisma/index';
import { AuthError, ValidationError } from '../../../../packages/error-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setCookie';
import Stripe from 'stripe';
import { config } from 'dotenv';
import { sendLog } from '../../../../packages/utils/logs/send-logs';
config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');

    const { name, email } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError('User already exists with this email!'));
    }

    await checkOtpRestrications(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'OTP sent to email. Please verify your account.',
    });
  } catch (error) {
    return next(error);
  }
};

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new ValidationError('All Fields are required!'));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError('User already exists with this email!'));
    }

    await verifyOtp(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User Registered Successfully!!',
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
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

    const accessToken = jwt.sign(
      { id: existingUser.id, role: 'user' },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: '1h',
      }
    );

    const refreshToken = jwt.sign(
      { id: existingUser.id, role: 'user' },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: '7d',
      }
    );

    setCookie(res, 'access_token', accessToken);
    setCookie(res, 'refresh_token', refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login Successful!!',
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

const handleUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('email is required!');
    }

    const userType = 'user';

    const user =
      userType === 'user'
        ? await prisma.user.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError(`${userType} not found!`);
    }

    await checkOtpRestrications(email, next);
    await trackOtpRequests(email, next);

    await sendOtp(user.name, email, 'forgot-password-user-mail');

    res
      .status(200)
      .json({ message: 'OTP sent to email.Please verify your account.' });
  } catch (error) {
    return next(error);
  }
};

const resetUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const email = req.user.email;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ValidationError('Some Fields are missing ...'));
    }

    if (newPassword !== confirmPassword) {
      return next(
        new AuthError('newPassword and confirmPassword  are not same!')
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return next(new AuthError("User doesn't exists with this email!"));
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password as string
    );

    if (!isPasswordValid) {
      return next(new AuthError('Current Password Not valid to reset.'));
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password as string
    );

    if (isSamePassword) {
      return next(new AuthError('New Password should be same as old one.'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: 'Password Updated Successfully!' });
  } catch (error) {
    return next(error);
  }
};

const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new ValidationError('email &  otp is required!'));
    }

    await verifyOtp(email, otp);

    res
      .status(200)
      .json({ message: 'OTP Verified. you can now reset your password.' });
  } catch (error) {
    return next(error);
  }
};

const updateUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return next(new ValidationError('Passwords do not match!'));
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return next(new ValidationError('User not found'));
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user?.password as string
    );

    if (!isPasswordValid) {
      return next(new ValidationError('Current password is incorrect'));
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newHashedPassword,
      },
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return next(error);
  }
};

const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email } = req.body;

    const existingUser = await prisma.sellers.findUnique({ where: { email } });

    if (existingUser) {
      return next(
        new ValidationError('seller already exists with this email!')
      );
    }

    await checkOtpRestrications(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, 'seller-activation-mail');

    res.status(200).json({
      message: 'OTP sent to email. Please verify your account.',
    });
  } catch (error) {
    return next(error);
  }
};

const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, otp, phone_number, password, country } = req.body;
    if (!email || !otp || !phone_number || !name || !password || !country) {
      return next(new ValidationError('All Fields are required!'));
    }

    const existingUser = await prisma.sellers.findUnique({ where: { email } });

    if (existingUser) {
      return next(
        new ValidationError('seller already exists with this email!')
      );
    }

    await verifyOtp(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone_number,
        country,
      },
    });

    res.status(200).json({
      success: true,
      message: 'seller Registered Successfully!!',
      seller: {
        id: seller.id,
        email: seller.email,
        name: seller.name,
        country: seller.country,
        phone_number: seller.phone_number,
        shopId: seller.shopId,
        stripeId: seller.stripeId,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createShop = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      bio,
      category,
      avatar,
      address,
      opening_hours,
      website,
      sellerId,
    } = req.body;

    if (
      !name ||
      !bio ||
      !category ||
      !address ||
      !opening_hours ||
      !website ||
      !sellerId
    ) {
      return next(new ValidationError('All Fields are required!'));
    }

    const shopData: any = {
      name,
      bio,
      category,
      avatar,
      address,
      opening_hours,
      website,
      sellerId,
    };

    if (website && website.trim() !== '') {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(200).json({
      success: true,
      message: 'shop Registered Successfully!!',
      shop,
    });
  } catch (error) {
    return next(error);
  }
};

const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError('Seller ID is required!'));
    }

    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      return next(new ValidationError('Seller is not available with this id!'));
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email: seller.email,
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/`,
      return_url: `http://localhost:3000/`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
};

const getLoggedInSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = await prisma.sellers.findUnique({
      where: {
        id: req.id,
      },
      include: {
        shop: true,
      },
    });

    res.status(200).json({ success: true, seller });
  } catch (error) {
    return next(error);
  }
};

const getLoggedInUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.id,
      },
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

const loginSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('email and password are required!'));
    }

    const seller = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (!seller) {
      return next(
        new ValidationError('Seller is not available with this email!')
      );
    }

    const isMatch = await bcrypt.compare(password, seller.password as string);

    if (!isMatch) {
      return next(new AuthError('Invalid Credentials'));
    }

    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: '1h',
      }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: '7d',
      }
    );

    setCookie(res, 'seller-access-token', accessToken);
    setCookie(res, 'seller-refresh-token', refreshToken);

    await sendLog({
      type: 'success',
      message: `seller loggedin ${seller?.email}`,
      source: 'auth-service',
    });

    res.status(200).json({
      success: true,
      message: 'Login Successful!!',
      seller: {
        id: seller.id,
        email: seller.email,
        name: seller.name,
        country: seller.country,
        phone_number: seller.phone_number,
        shopId: seller.shopId,
        stripeId: seller.stripeId,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

const getSeller = async (req: any, res: Response, next: NextFunction) => {
  try {
    const seller = req.seller;

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    await sendLog({
      type: 'success',
      message: `User data retrieved ${user?.email}`,
      source: 'auth-service',
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

const addUserAddress = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { name, street, city, zip, country, isDefault } = req.body;

    if (!name || !street || !city || !zip || !country) {
      return new ValidationError('All fields are required!!');
    }

    if (!isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });

    res.status(200).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!addressId) {
      return next(new ValidationError('addressId is required!!'));
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existingAddress) {
      return next(new ValidationError('address not found!!'));
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'address deleted successfully!!',
    });
  } catch (error) {
    return next(error);
  }
};

const getUserAddress = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const userAddresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      address: userAddresses,
    });
  } catch (error) {
    return next(error);
  }
};

const getLayoutData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const layout = await prisma.site_Config.findFirst();

    res.status(200).json({
      success: true,
      layout,
    });
  } catch (error) {
    return next(error);
  }
};

const refreshToken = async (req: any, res: Response, next: NextFunction) => {
  try {
    const refreshToken =
      req.cookies['refresh_token'] ||
      req.cookies['seller-refresh-token'] ||
      req.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      return new ValidationError('Unauthorized! NO refresh token!!');
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new ValidationError('Forbidden! Invalid refresh token!!');
    }

    let account;
    if (decoded.role === 'user') {
      account = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: {
          id: decoded.id,
        },
        include: { shop: true },
      });
    }

    if (!account) {
      return new ValidationError('Forbidden! Invalid User/seller not found!!');
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: '1h',
      }
    );

    if (decoded.role === 'user') {
      setCookie(res, 'access_token', newAccessToken);
    } else {
      setCookie(res, 'seller-access-token', newAccessToken);
    }

    req.role = decoded.role;

    res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

export {
  userRegistration,
  verifyUser,
  createShop,
  verifySeller,
  loginUser,
  handleUserForgotPassword,
  resetUserPassword,
  verifyForgotPasswordOtp,
  registerSeller,
  createStripeConnectLink,
  loginSeller,
  getSeller,
  refreshToken,
  getLoggedInSeller,
  getLoggedInUser,
  updateUserPassword,
  addUserAddress,
  deleteUserAddress,
  getUserAddress,
  getUser,
  getLayoutData,
};
