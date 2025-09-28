import { AuthMiddleware } from '../../../../packages/middleware/authMiddleware';
import express from 'express';
import {
  createPaymentIntent,
  createPaymentSession,
  getOrderDetails,
  getSellerOrders,
  getUserOrders,
  updateDeliveryStatus,
  verifyPaymentSession,
} from '../controller/order-controller';
import { isSeller } from '../../../../packages/middleware/authorizeRoles';

export const router = express.Router();

router.post('/create-payment-intent', AuthMiddleware, createPaymentIntent);

router.post('/create-payment-session', AuthMiddleware, createPaymentSession);

router.get('/verify-payment-session', AuthMiddleware, verifyPaymentSession);

router.get('/get-seller-orders', AuthMiddleware, isSeller, getSellerOrders);

router.get('/get-my-orders', AuthMiddleware, getUserOrders);

router.put('/update-delivery-status/:orderId', AuthMiddleware, updateDeliveryStatus);

router.get(
  '/get-order-details/:orderId',
  AuthMiddleware,
  isSeller,
  getOrderDetails
);
