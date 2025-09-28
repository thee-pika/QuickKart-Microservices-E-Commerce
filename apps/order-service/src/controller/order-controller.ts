import { ValidationError } from '../../../../packages/error-handler/index';
import redis from '../../../../packages/libs/redis';
import { NextFunction, Response } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../../packages/libs/prisma/index';
import { sendMail } from '../utils/sendMail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, sessionId } = req.body;

    const customerAmount = Math.round(amount * 100);

    const platformFee = Math.floor(customerAmount * 0.1);


    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        sessionId,
        userId: req.user.id,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return next(error);
  }
};

export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user.id;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError('cart is empty or invalid.'));
    }

    const normalizedCart = JSON.stringify(
      cart
        .map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          salePrice: item.salePrice,
          shopId: item.shopId,
          selectedOptions: item.selectedOptions || {},
        }))
        .sort((a, b) => a.id.localCompare(b.id))
    );

    const keys = await redis.keys('payment-session:*');
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                salePrice: item.salePrice,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
              }))
              .sort((a: any, b: any) => a.id.localCompare(b.id))
          );

          if (existingCart === normalizedCart) {
            return res.status(200).json({ sessionId: key.split(':')[1] });
          } else {
            await redis.del(key);
          }
        }
      }
    }

    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];

    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: uniqueShopIds,
        },
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
          },
        },
      },
    });

    const totalAmount = cart.reduce((total: number, item: any) => {
      return total + item.quantity * item.salePrice;
    }, 0);

    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId,
      cart,
      sellers: shops,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: coupon || null,
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      600,
      JSON.stringify(sessionData)
    );

    return res.status(201).json({ sessionId });
  } catch (error) {
    return next(error);
  }
};

export const verifyPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return next(new ValidationError('sessionId not found.'));
    }

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return next(new ValidationError('session not found or expired.'));
    }

    const session = JSON.parse(sessionData);

    return res.status(200).json({ success: true, session });
  } catch (error) {
    return next(error);
  }
};

export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers['stripe-signature'];
    if (!stripeSignature) {
      return next(new ValidationError('Missing stripeSignature.'));
    }

    const rawBody = (req as any).rawBody;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {

      return res
        .status(400)
        .json({ message: `webhook error: ${error.message}` });
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn('Session data expired or misisng for', sessionId);
        return res
          .status(200)
          .json({ message: 'No session found, skipping order creation' });
      }

      const { cart, totalAmount, shippingAddressId, coupon } =
        JSON.parse(sessionData);

      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      const name = user?.name!;
      const email = user?.email!;

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      }, {});

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];

        let orderTotal = orderItems.reduce(
          (sum: number, p: any) => sum + p.quantity * p.salePrice,
          0
        );

        if (
          coupon &&
          coupon.discountProductId &&
          orderItems.some((item: any) => item.id === coupon.discountProductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountProductId
          );

          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.salePrice *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;

            orderTotal -= discount;
          }
        }

        const order = await prisma.orders.create({
          data: {
            userId,
            shopId,
            total: orderTotal,
            status: 'Paid',
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount || 0,
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.salePrice,
                selectedOptions: item.selectedOptions,
              })),
            },
          },
        });

        for (const item of orderItems) {
          const { id: productId, quantity } = item;

          await prisma.product.update({
            where: {
              id: productId,
            },
            data: {
              stock: {
                decrement: quantity,
              },
              totalSales: {
                increment: quantity,
              },
            },
          });

          await prisma.productAnalytics.upsert({
            where: {
              productId,
            },
            create: {
              productId,
              shopId,
              purchases: quantity,
              lastViewedAt: new Date(),
            },
            update: {
              purchases: {
                increment: quantity,
              },
            },
          });

          const existingAnalytics = await prisma.userAnalytics.findFirst({
            where: {
              userId,
            },
          });

          const newAction = {
            shopId,
            action: 'purchase',
            timestamp: Date.now(),
          };

          const currentActions = Array.isArray(existingAnalytics?.actions)
            ? (existingAnalytics.actions as Prisma.JsonArray)
            : [];

          if (existingAnalytics) {
            await prisma.userAnalytics.update({
              where: {
                userId,
              },
              data: {
                lastVisited: new Date(),
                actions: [...currentActions, newAction],
              },
            });
          } else {
            await prisma.userAnalytics.create({
              data: {
                userId,
                lastVisited: new Date(),
                actions: [newAction],
                lastTrained: new Date(),
              },
            });
          }
        }

        await sendMail(
          email as string,
          'your Quickkart order-confirmation',
          'order-confirmation',
          {
            name,
            cart,
            totalAmout: coupon?.discountAmount
              ? totalAmount - coupon?.discountAmount
              : totalAmount,
            trackingUrl: `https://Quickkart.com/order/${order.id}`,
          }
        );

        const createdShopIds = Object.keys(shopGrouped);
        const sellerShops = await prisma.shops.findMany({
          where: {
            id: {
              in: createdShopIds,
            },
          },
          select: {
            id: true,
            sellerId: true,
            name: true,
          },
        });

        for (const shop of sellerShops) {
          const firstProduct = shopGrouped[shop.id][0];
          const productTitle = firstProduct?.title || 'new item';

          await prisma.notifications.create({
            data: {
              title: 'New Order Received',
              message: `A customer just ordered ${productTitle} from your shop.`,
              creatorId: userId,
              receivedId: shop.sellerId,
              redirect_link: `https://Quickkart.com/order/${sessionId}`,
            },
          });
        }

        await prisma.notifications.create({
          data: {
            title: 'Platform Order Alert',
            message: `A new order was placed by ${name}.`,
            creatorId: userId,
            receivedId: 'admin',
            redirect_link: `https://Quickkart.com/order/${sessionId}`,
          },
        });

        await redis.del(sessionKey);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    return next(error);
  }
};

export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
  
    const shop = await prisma.shops.findUnique({
      where: {
        sellerId: req.seller?.id,
      },
    });

    const orders = await prisma.orders.findMany({
      where: {
        shopId: shop?.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {

    return next(error);
  }
};

export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.orders.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    return next(error);
  }
};

export const getOrderDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.orderId;
    if (!orderId) {
      return next(new ValidationError('orderId not found!!'));
    }

    const order = await prisma.orders.findFirst({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return next(new ValidationError('order not found!!'));
    }

    const shippingAddress = order?.shippingAddressId
      ? await prisma.address.findFirst({
          where: {
            id: order?.shippingAddressId,
          },
        })
      : null;

    const coupon = order?.couponCode
      ? await prisma.discount_Codes.findFirst({
          where: {
            discountCode: order?.couponCode,
          },
        })
      : null;

    const productIds = order?.items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        images: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = order?.items.map((item) => ({
      ...item,
      selectedOptions: item.selectedOptions,
      product: productMap.get(item.productId) || null,
    }));
    res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        shippingAddress,
        couponCode: coupon,
      },
    });
  } catch (error) {
  
    return next(error);
  }
};

export const updateDeliveryStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    if (!orderId || !deliveryStatus) {
      return next(
        new ValidationError('Details are required for updating the status.')
      );
    }

    const allowedStatuses = [
      'PLACED',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    if (!allowedStatuses.includes(deliveryStatus)) {
      return next(new ValidationError('Invalid delivery status.'));
    }

    const existingOrder = await prisma.orders.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return next(new ValidationError('order not found!!.'));
    }

    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        deliverystatus: deliveryStatus,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Delivery status updated successfully!!',
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};
