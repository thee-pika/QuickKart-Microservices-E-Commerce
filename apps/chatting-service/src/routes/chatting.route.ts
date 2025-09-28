import { AuthMiddleware } from '../../../../packages/middleware/authMiddleware';
import express from 'express';
import {
  fetchMessages,
  fetchSellerMessages,
  getSellerConversations,
  getUserConversations,
  newConversation,
} from '../controllers/chatting.controller';
import { isSeller } from '../../../../packages/middleware/authorizeRoles';

export const chatRouter = express.Router();

chatRouter.post(
  '/create-user-conversationGroup',
  AuthMiddleware,
  newConversation
);

chatRouter.get('/get-user-conversations', AuthMiddleware, getUserConversations);

chatRouter.get(
  '/get-seller-conversations',
  AuthMiddleware,
  isSeller,
  getSellerConversations
);

chatRouter.get('/get-messages/:conversationId', AuthMiddleware, fetchMessages);

chatRouter.get(
  '/get-seller-messages/:conversationId',
  AuthMiddleware,
  isSeller,
  fetchSellerMessages
);
