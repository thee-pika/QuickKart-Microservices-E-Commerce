import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import express from 'express';
import { adminRouter } from './routes/admin.route';

const app = express();
app.use(express.json({ limit: "5mb" }));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to admin-service!' });
});

app.use('/api', adminRouter);

app.use(errorMiddleware);

const port = process.env.PORT || 5004;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
