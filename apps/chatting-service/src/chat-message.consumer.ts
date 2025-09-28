import { Consumer, EachMessagePayload } from 'kafkajs';
import { kafka } from '../../../packages/utils/kafka';
import { prisma } from '../../../packages/libs/prisma/index';
import redis from '../../../packages/libs/redis';

interface BufferedMessage {
  senderId: string;
  content: string;
  conversationId: string;
  senderType: string;
  createdAt: string;
}

const TOPIC = 'chat.new_message';
const GROUP_ID = 'chat-message-db-writer';
const BATCH_INTERVAL_MS = 3000;

let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

export async function startConsumer() {
  const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;

      try {
        const parsed = JSON.parse(message.value.toString());
        buffer.push(parsed);

        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
      } catch (error) {
        console.log('Failed to parse kafka message:', error);
      }
    },
  });
}

async function flushBufferToDb() {
  const toInsert = buffer.splice(0, buffer.length);
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (toInsert.length === 0) return;
  try {
    const prismaPayload = toInsert.map((msg) => ({
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderType: msg.senderType,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    }));

    await prisma.message.createMany({
      data: prismaPayload,
    });

    for (const msg of prismaPayload) {
      const receiverType = msg.senderType === 'seller' ? 'user' : 'seller';
      await incrementUnseenCount(receiverType, msg.conversationId);
    }

  } catch (error) {
    console.error('Error inserting messages to DB:', error);
    buffer.unshift(...toInsert);
    if (!flushTimer) {
      flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
    }
  }
}

export const incrementUnseenCount = async (
  receiverType: 'user' | 'seller',
  conversationId: string
) => {
  const key = `unseen_${receiverType}_${conversationId}`;
  await redis.incr(key);
};

export const getUnseenCount = async (
  receiverType: 'user' | 'seller',
  conversationId: string
): Promise<number> => {
  const key = `unseen_${receiverType}_${conversationId}`;
  const count = await redis.get(key);
  return parseInt(count || '0');
};

export const clearUnseenCount = async (
  receiverType: 'user' | 'seller',
  conversationId: string
) => {
  const key = `unseen_${receiverType}_${conversationId}`;
  await redis.del(key);
};
