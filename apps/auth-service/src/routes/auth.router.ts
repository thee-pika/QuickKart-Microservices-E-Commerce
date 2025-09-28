import express from 'express';
import {
  addUserAddress,
  createShop,
  createStripeConnectLink,
  deleteUserAddress,
  getLayoutData,
  getLoggedInSeller,
  getLoggedInUser,
  getSeller,
  getUser,
  getUserAddress,
  handleUserForgotPassword,
  loginSeller,
  loginUser,
  registerSeller,
  resetUserPassword,
  userRegistration,
  verifyForgotPasswordOtp,
  verifySeller,
  verifyUser,
} from '../controller/auth.controller';
import { AuthMiddleware } from '../../../../packages/middleware/authMiddleware';
import {
  isSeller,
  isUser,
} from '../../../../packages/middleware/authorizeRoles';

export const router = express.Router();

router.get('/user', getUser);
router.get('/user/api/get-layouts', getLayoutData);
router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('/forgot-password-user', handleUserForgotPassword);
router.post('/verify-forgot-password-user', verifyForgotPasswordOtp);
router.post('/reset-password-user', resetUserPassword);
router.post('/seller-registration', registerSeller);
router.post('/verify-seller', verifySeller);
router.post('/create-shop', createShop);
router.post('/login-seller', loginSeller);
router.post('/create-stripe-connection-link', createStripeConnectLink);
router.get('/logged-in-user', AuthMiddleware, isUser, getLoggedInUser);
router.get('/logged-in-seller', AuthMiddleware, isSeller, getLoggedInSeller);
router.get('/seller', getSeller);

router.post('/add-address', AuthMiddleware, addUserAddress);

router.get('/delete-address/:addressId', AuthMiddleware, deleteUserAddress);

router.get('/shipping-address/', AuthMiddleware, getUserAddress);

// router.get('/get-layouts', getWebsiteLayout);
