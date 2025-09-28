import { Response } from 'express';

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 1000,
  });
};
