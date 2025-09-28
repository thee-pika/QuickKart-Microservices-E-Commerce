import { NextFunction, Request, Response } from 'express';
import { AppError } from '.';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {

    return res.status(err.statusCode).json({
      status: 'error',
      success: false,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  return res.status(500).json({
    error: 'Something went Wrong, please try again.',
    success: false,
  });
};
