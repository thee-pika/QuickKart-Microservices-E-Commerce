import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { router } from './routes/order-route';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import { createOrder } from './controller/order-controller';
const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.post(
  '/api/create-order',
  bodyParser.raw({
    type: 'application/json',
  }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  createOrder
);

app.use(express.json({ limit: '100mb' }));
app.use(bodyParser.json());

app.get('/hello', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
});

app.use('/api', router);
app.use(errorMiddleware);

const port = process.env.PORT || 5003;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
