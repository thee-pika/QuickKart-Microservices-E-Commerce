import { AuthError, ValidationError } from '../../../../packages/error-handler';
import { NextFunction, Response } from 'express';
import { prisma } from '../../../../packages/libs/prisma/index';
import redis from '../../../../packages/libs/redis';
import { clearUnseenCount, getUnseenCount } from '../chat-message.consumer';

export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    const userId = req.user.id;

    if (!sellerId) {
      return next(new ValidationError('Seller ID is required!'));
    }

    const existingGroup = await prisma.conversationGroup.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });

    if (existingGroup) {
      return res.status(200).json({
        conversation: existingGroup,
        isNew: false,
      });
    }

    const newGroup = await prisma.conversationGroup.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, sellerId],
      },
    });

    await prisma.participant.createMany({
      data: [
        {
          conversationId: newGroup.id,
          userId,
        },
        {
          conversationId: newGroup.id,
          sellerId,
        },
      ],
    });

    res.status(201).json({
      conversation: newGroup,
      isNew: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        const sellerParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            sellerId: {
              not: null,
            },
          },
        });

        let seller = null;
        if (sellerParticipant?.sellerId) {
          seller = await prisma.sellers.findUnique({
            where: {
              id: sellerParticipant.sellerId,
            },
            include: {
              shop: true,
            },
          });
        }

        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        let isOnline = false;
        if (sellerParticipant?.sellerId) {
          const redisKey = `online:seller:${sellerParticipant.sellerId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount('user', group.id);
        return {
          conversationId: group.id,
          seller: {
            id: seller?.id || null,
            name: seller?.shop?.name || 'Unknown',
            isOnline,
            avatar: seller?.shop?.coverBanner,
          },
          lastMessage:
            lastMessage?.content || 'Say Something to start a conversation.',
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      })
    );

    res.status(201).json({
      conversations: responseData,
      isNew: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    const conversations = await prisma.conversationGroup.findMany({
      where: {
        participantIds: {
          has: sellerId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const responseData = await Promise.all(
      conversations.map(async (group) => {
        const sellerParticipant = await prisma.participant.findFirst({
          where: {
            conversationId: group.id,
            userId: {
              not: null,
            },
          },
        });

        let user = null;
        if (sellerParticipant?.userId) {
          user = await prisma.user.findUnique({
            where: {
              id: sellerParticipant.userId,
            },
            include: {
              avatar: true,
            },
          });
        }

        const lastMessage = await prisma.message.findFirst({
          where: {
            conversationId: group.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        let isOnline = false;
        if (sellerParticipant?.userId) {
          const redisKey = `online:user:${sellerParticipant.userId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount('seller', group.id);
        return {
          conversationId: group.id,
          user: {
            id: user?.id || null,
            name: user?.name || 'Unknown',
            isOnline,
            avatar: user?.avatar,
          },
          lastMessage:
            lastMessage?.content || 'Say Something to start a conversation.',
          lastMessageAt: lastMessage?.createdAt || group.updatedAt,
          unreadCount,
        };
      })
    );

    res.status(201).json({
      conversations: responseData,
      isNew: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let participantId;
    if (req.role === 'user') {
      participantId = req.user.id;
    } else {
      participantId = req.seller.id;
    }

    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError('conversation ID is required!'));
    }

    const conversation = await prisma.conversationGroup.findFirst({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return next(new ValidationError('conversation ID is required!'));
    }

    const hasAccess = conversation.participantIds.includes(participantId);
    if (!hasAccess) {
      return next(new AuthError('Access denied to this conversation!'));
    }

    await clearUnseenCount('user', conversationId);

    const sellerParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        sellerId: {
          not: null,
        },
      },
    });

    let seller = null;
    let isOnline = false;

    if (sellerParticipant?.sellerId) {
      seller = await prisma.sellers.findFirst({
        where: {
          id: sellerParticipant.sellerId,
        },
        include: {
          shop: true,
        },
      });

      const redisKey = `online:seller:${sellerParticipant.sellerId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.status(201).json({
      messages,
      seller: {
        id: seller?.id || null,
        name: seller?.shop?.name || 'Unknown',
        avatar: seller?.shop?.coverBanner || null,
        isOnline,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchSellerMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError('conversation ID is required!'));
    }

    const conversation = await prisma.conversationGroup.findFirst({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      return next(new ValidationError('conversation ID is required!'));
    }

    const hasAccess = conversation.participantIds.includes(sellerId);
    if (!hasAccess) {
      return next(new AuthError('Access denied to this conversation!'));
    }

    await clearUnseenCount('seller', conversationId);

    const userParticipant = await prisma.participant.findFirst({
      where: {
        conversationId,
        userId: {
          not: null,
        },
      },
    });

    let user = null;
    let isOnline = false;

    if (userParticipant?.userId) {
      user = await prisma.user.findFirst({
        where: {
          id: userParticipant.userId,
        },
        include: {
          avatar: true,
        },
      });

      const redisKey = `online:user:${userParticipant.userId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.status(201).json({
      messages,
      user: {
        id: user?.id || null,
        name: user?.name || 'Unknown',
        isOnline,
        avatar: user?.avatar,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};
