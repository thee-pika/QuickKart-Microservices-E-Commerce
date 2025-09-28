import { AuthMiddleware } from '../../../../packages/middleware/authMiddleware';
import express from 'express';
import {
  deleteShop,
  editSellerProfile,
  followShop,
  getSellerEvents,
  getSellerInfo,
  getSellerProducts,
  getSellerShopDetails,
  getShopDetails,
  isFollowing,
  markNotificationAsRead,
  restoreShop,
  sellerNotifications,
  unFollowShop,
  updateProfilePicture,
  uploadImage,
} from '../controllers/seller.controller';

export const sellerRouter = express.Router();

sellerRouter.delete('/delete-shop', AuthMiddleware, deleteShop);

sellerRouter.patch('/restore-shop', AuthMiddleware, restoreShop);

sellerRouter.post('/upload-image', AuthMiddleware, uploadImage);

sellerRouter.put('/update-image', AuthMiddleware, updateProfilePicture);

sellerRouter.put('/edit-profile', AuthMiddleware, editSellerProfile);

sellerRouter.get('/get-shop-details',AuthMiddleware,  getSellerShopDetails);

sellerRouter.get('/get-seller/:id', getSellerInfo);

sellerRouter.get('/get-shop/:id', getShopDetails);

sellerRouter.get('/get-seller-products/:id', getSellerProducts);

sellerRouter.get('/get-seller-events/:id', getSellerEvents);

sellerRouter.get('/seller-notifications', AuthMiddleware, sellerNotifications);

sellerRouter.post('/follow-shop', AuthMiddleware, followShop);

sellerRouter.post('/unfollow-shop', AuthMiddleware, unFollowShop);

sellerRouter.get('/is-following/:id', AuthMiddleware, isFollowing);

sellerRouter.get(
  '/mark-notification-as-read',
  AuthMiddleware,
  markNotificationAsRead
);
