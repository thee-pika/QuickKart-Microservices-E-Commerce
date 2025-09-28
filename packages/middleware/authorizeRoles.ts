import { AuthError } from '../../packages/error-handler';
import { NextFunction, Response } from 'express';

export const isSeller = (req: any, res: Response, next: NextFunction) => {
 
  if (req.role !== 'seller') {
    return next(new AuthError('Access Denied: Seller Only'));
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  
  if (req.role !== 'user') {
    return next(new AuthError('Access Denied: User Only'));
  }
  next();
};
