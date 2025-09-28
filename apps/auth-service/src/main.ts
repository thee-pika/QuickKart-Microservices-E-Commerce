import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import { config } from 'dotenv';
import { router } from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';

const swaggerDocument = require('./swagger-output.json');

config();

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000','http://localhost:3001'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(cookieParser());
app.set('trust proxy', 1);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: 'Too many Requests try after some time',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => ipKeyGenerator(req),
});

app.use(limiter);

app.get('/', (req, res) => {
  res.send({ message: 'Hello From Auth Service' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.send(swaggerDocument);
});

app.use('/api', router);
app.use(errorMiddleware);

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});
