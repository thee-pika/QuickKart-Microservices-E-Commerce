import { ValidationError } from '../../../../packages/error-handler';
import { NextFunction } from 'express';
import { randomInt } from 'crypto';
import { sendMail } from './sendMail';
import redis from '../../../../packages/libs/redis';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
): void => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError('Missing Required Fields!');
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid Email Format!');
  }
};

export const checkOtpRestrications = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        'Account locked due to multiple failed attempts! Try again after 30 minutes.'
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        'Too many OTP requests! Please wait 1 hour before requesting again.'
      )
    );
  }
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = randomInt(1000, 9999).toString();
  await sendMail(email, 'verify your email', template, { name, otp });
  await redis.set(`otp:${email}`, otp, 'EX', 300);
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let optRequests = parseInt((await redis.get(otpRequestKey)) || '0');

  if (optRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600);
    return next(
      new ValidationError(
        'Too many OTP requests! Please wait 1 hour before requesting again.'
      )
    );
  }

  await redis.set(otpRequestKey, optRequests + 1, 'EX', 3600);
};

export const verifyOtp = async (email: string, otp: string) => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    throw new ValidationError('Invalid or Expired OTP');
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');
  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);
      await redis.del(`otp:${email}`, failedAttemptsKey);

      throw new ValidationError(
        'Too many failed attempts! your account is locked for 30 minutes!'
      );
    }

    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);

    throw new ValidationError(
      `Incorrect OTP. ${2 - failedAttempts} attempts left.`
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};
