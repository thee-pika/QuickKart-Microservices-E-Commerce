import express from 'express';
import { createWebSocketServer } from './webSocket';
import { startConsumer } from './chat-message.consumer';
import { chatRouter } from './routes/chatting.route';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to chatting-service!' });
});

app.use('/api', chatRouter);

const port = process.env.PORT || 5005;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

createWebSocketServer(server);

startConsumer().catch((error: any) => {
  console.log('error in starting the consumer.', error);
});

server.on('error', console.error);
