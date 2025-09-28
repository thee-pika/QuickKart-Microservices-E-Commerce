import { Kafka } from 'kafkajs';
import {config} from "dotenv";
config();


export const kafka = new Kafka({
  connectionTimeout: 10000,
  authenticationTimeout: 10000,
  clientId: 'kafka-service',
  brokers: ['pkc-921jm.us-east-2.aws.confluent.cloud:9092'],
  ssl: true,
  sasl: {
    mechanism: 'plain',
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  },
});
