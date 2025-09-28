import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import express from 'express';
import { router } from './routes/recommendation.route';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to recommendation-service!' });
});

app.use('/api', router);
app.use(errorMiddleware);

const port = process.env.PORT || 5008;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
