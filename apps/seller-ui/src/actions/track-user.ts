'use server';
import { kafka } from  "../../../../packages/utils/kafka";

type EventData = {
  userId?: string;
  productId?: string;
  shopId?: string;
  action: string;
  device?: string;
  country?: string;
  city?: string;
};

const producer = kafka.producer();

export async function sendKafkaEvent(eventData: EventData) {
  try {
    await producer.connect();
    await producer.send({
      topic: 'users-events',
      messages: [{ value: JSON.stringify(eventData) }],
    });
  } catch (error) {
  } finally {
    await producer.disconnect();
  }
}
