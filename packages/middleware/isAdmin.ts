import { NextFunction, Response } from 'express';

import jwt from 'jsonwebtoken';
import { prisma } from '../libs/prisma';
import { ValidationError } from '../../packages/error-handler';

export const isAdmin = async (req: any, res: Response, next: NextFunction) => {
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

    if (decoded.role !== 'admin') {
      return new ValidationError('unauthorized access!!');
    }

    const admin = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!admin) {
      return new ValidationError('Forbidden! Invalid admin not found!!');
    }

    req.role = decoded.role;
    req.id = decoded.id;

    req.admin = admin;

    next();
  } catch (error) {
    console.log('error came', error);
    return next(error);
  }
};
