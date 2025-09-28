import { kafka } from '../../../packages/utils/kafka/index';
import redis from '../../../packages/libs/redis/index';
import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

const producer = kafka.producer();

const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();

type IncomingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

export async function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  await producer.connect();

  wss.on('connection', (ws: WebSocket) => {
    let registeredUserId: string | null = null;
    ws.on('message', async (rawMessage) => {
      try {
        const messageStr = rawMessage.toString();

        if (!registeredUserId && !messageStr.startsWith('{')) {
          registeredUserId = messageStr;
          connectedUsers.set(registeredUserId, ws);

          const isSeller = registeredUserId.startsWith('seller_');
          const redisKey = isSeller
            ? `online:seller:${registeredUserId.replace('seller_', '')}`
            : `online:user:${registeredUserId}`;

          await redis.set(redisKey, '1');
          await redis.expire(redisKey, 300);
          return;
        }

        const data: IncomingMessage = await JSON.parse(messageStr);

        if (data.type === 'MARK_AS_SEEN' && registeredUserId) {
          const seenKey = `${registeredUserId}_${data.conversationId}`;
          unseenCounts.set(seenKey, 0);
          return;
        }

        const {
          type,
          messageBody,
          senderType,
          conversationId,
          fromUserId,
          toUserId,
        } = data;

        if (!data || !toUserId || !messageBody || !conversationId) {
          console.warn('Invalid message format.');
          return;
        }

        const now = new Date();

        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: 'NEW_MESSAGE',
          payload: messagePayload,
        });

        const receiverKey =
          senderType === 'user' ? `seller_${toUserId}` : `user_${toUserId}`;
        const senderKey =
          senderType === 'user' ? `user_${fromUserId}` : `seller_${fromUserId}`;

        const unseenKey = `${receiverKey}_${conversationId}`;
        const prevCount = unseenCounts.get(unseenKey) || 0;
        unseenCounts.set(unseenKey, prevCount + 1);

        const receiverSocket = connectedUsers.get(receiverKey);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(messageEvent);

          receiverSocket.send(
            JSON.stringify({
              type: 'UNSEEN_COUNT_UPDATE',
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            })
          );
        } else {
          console.log(`User ${receiverKey} is offline. Message queued.`);
        }

        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
        }

        await producer.send({
          topic: 'chat.new_message',
          messages: [
            {
              key: conversationId,
              value: JSON.stringify(messagePayload),
            },
          ],
        });
      } catch (error) {
        console.log(`error processing websocket message`, error);
      }
    });
    ws.on('close', async () => {
      if (registeredUserId) {
        connectedUsers.delete(registeredUserId);

        const isSeller = registeredUserId.startsWith('seller_');
        const redisKey = isSeller
          ? `online:seller:${registeredUserId.replace('seller_', '')}`
          : `online:user:${registeredUserId}`;

        await redis.del(redisKey);
      }
    });
    ws.on('error', (err) => {
      console.error('WebSocket error :', err);
    });
  });
}
