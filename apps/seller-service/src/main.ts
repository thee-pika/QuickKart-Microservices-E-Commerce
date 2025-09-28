import express from 'express';
import { sellerRouter } from './routes/seller.route';
import cors from 'cors';
import bodyParser from 'body-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';

const app = express();
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '100mb' }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to seller-service!' });
});

app.use('/api', sellerRouter);
app.use(errorMiddleware);

const port = process.env.PORT || 5006;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
