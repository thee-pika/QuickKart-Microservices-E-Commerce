import express from 'express';
import {
  addNewAdmin,
  getAllAdminNotifications,
  getAllAdmins,
  getAllDiscountCodes,
  getAllEvents,
  getAllOrders,
  getAllProducts,
  getAllSellers,
  getAllStats,
  getAllUsers,
  getCustomizations,
  getLoggedInAdmin,
  getUserNotifications,
  loginAdmin,
  markNotificationAsRead,
  updateAvatar,
  updateCustomizationBrandName,
  updateLogoOrBanner,
  updateUserDetails,
  uploadImage,
} from '../controllers/admin.controller';
import { AuthMiddleware } from '../../../../packages/middleware/authMiddleware';
import { isAdmin } from '../../../../packages/middleware/isAdmin';

export const adminRouter = express.Router();

adminRouter.post('/login-admin', loginAdmin);

adminRouter.get('/logged-in-admin', AuthMiddleware, getLoggedInAdmin);

adminRouter.get(
  '/mark-notification-as-read',
  AuthMiddleware,
  markNotificationAsRead
);

adminRouter.get('/get-all-products', AuthMiddleware, isAdmin, getAllProducts);

adminRouter.get('/get-all-stats', AuthMiddleware, isAdmin, getAllStats);

adminRouter.get('/get-all-events', AuthMiddleware, isAdmin, getAllEvents);

adminRouter.get('/get-all-admins', AuthMiddleware, isAdmin, getAllAdmins);

adminRouter.get('/add-new-admin', AuthMiddleware, isAdmin, addNewAdmin);

adminRouter.get('/get-all-sellers', AuthMiddleware, isAdmin, getAllSellers);

adminRouter.get('/get-all-users', AuthMiddleware, isAdmin, getAllUsers);

adminRouter.get('/get-all-orders', AuthMiddleware, isAdmin, getAllOrders);

adminRouter.get(
  '/get-all-discountcodes',
  AuthMiddleware,
  isAdmin,
  getAllDiscountCodes
);

adminRouter.get('/get-all-customizations', getCustomizations);

adminRouter.put('/update-logo-or-banner', AuthMiddleware, updateLogoOrBanner);

adminRouter.put('/update-brand', AuthMiddleware, updateCustomizationBrandName);

adminRouter.get('/upload-image', uploadImage);

adminRouter.get(
  '/get-all-notifications',
  AuthMiddleware,
  isAdmin,
  getAllAdminNotifications
);

adminRouter.get(
  '/get-user-notifications',
  AuthMiddleware,
  getUserNotifications
);

adminRouter.put('/update-avatar', AuthMiddleware, isAdmin, updateAvatar);

adminRouter.put(
  '/update-user-details',
  AuthMiddleware,
  isAdmin,
  updateUserDetails
);
