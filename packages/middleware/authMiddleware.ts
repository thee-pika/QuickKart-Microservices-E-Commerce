import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ValidationError } from '../../packages/error-handler';
import { prisma } from '../../packages/libs/prisma/index';
import { config } from 'dotenv';
config();

export const AuthMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return new ValidationError('Unauthorized! NO refresh token!!');
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new ValidationError('Unauthorized! NO refresh token!!');
    }

    let account;
    if (decoded.role === 'user' || decoded.role === 'admin') {
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

    req.role = decoded.role;
    req.id = decoded.id;

    if (req.role === 'user') {
      req.user = account;
    } else if (req.role === 'admin') {
      req.admin = account;
    } else {
      req.seller = account;
    }

    next();
  } catch (error) {
    return next(new ValidationError('Authentication Error!!'));
  }
};
