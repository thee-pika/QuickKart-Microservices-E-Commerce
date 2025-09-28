import { AuthMiddleware } from '../../../../packages/middleware/authMiddleware';
import express from 'express';
import { getRecommendedProducts } from '../controllers/recommendation.controller';

export const router = express.Router();

router.get(
  '/get-recommendation-products',
  AuthMiddleware,
  getRecommendedProducts
);
