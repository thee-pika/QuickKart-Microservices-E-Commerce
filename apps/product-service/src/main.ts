import express from 'express';
import { productRouter } from './routes/product.route';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import "./jobs/product-cron-job";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get('/health', (req, res) => {
  res.send({ message: 'Welcome to product-service!' });
});

app.use('/api', productRouter);
app.use(errorMiddleware);

const port = process.env.PORT || 5002;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

server.on('error', console.error);
