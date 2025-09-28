import express, { Router } from 'express';
import {
  applyDiscountCode,
  createDiscountCodes,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllEvents,
  getAllProducts,
  getCategories,
  getDiscountCode,
  getFilteredEvents,
  getFilteredProducts,
  getFilteredShops,
  getProductDetails,
  getShopProducts,
  restoreProduct,
  searchProducts,
  topShops,
  uploadProductImage,
} from '../controllers/product.controller';
import { AuthMiddleware } from '../../../../packages/middleware/authMiddleware';

export const productRouter: Router = express.Router();

productRouter.get('/get-categories', getCategories);

productRouter.post(
  '/create-discount-code',
  AuthMiddleware,
  createDiscountCodes
);

productRouter.post('/apply-discount-code', AuthMiddleware, applyDiscountCode);

productRouter.get('/get-discount-code', AuthMiddleware, getDiscountCode);

productRouter.delete(
  '/delete-discount-code',
  AuthMiddleware,
  deleteDiscountCode
);

productRouter.post('/create-product', AuthMiddleware, createProduct);

productRouter.post('/upload-product-image', AuthMiddleware, uploadProductImage);

productRouter.delete(
  '/delete-product-image',
  AuthMiddleware,
  deleteProductImage
);

productRouter.get('/get-all-products', getAllProducts);

productRouter.get('/get-shop-products', AuthMiddleware, getShopProducts);

productRouter.post('/restore-product', AuthMiddleware, restoreProduct);

productRouter.get('/get-product/:slug', getProductDetails);

productRouter.get('/get-filtered-products/', getFilteredProducts);

productRouter.get('/get-filtered-events/', getFilteredEvents);

productRouter.get('/get-all-events/', getAllEvents);

productRouter.get('/get-filtered-shops/', getFilteredShops);

productRouter.get('/search-products/', searchProducts);

productRouter.get('/top-shops/', topShops);

productRouter.delete('/delete-product', AuthMiddleware, deleteProduct);
