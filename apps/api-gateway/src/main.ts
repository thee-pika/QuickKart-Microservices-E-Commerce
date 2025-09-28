import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import proxy from 'express-http-proxy';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import morgan from 'morgan';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
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

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use('/recommendation', proxy('http://localhost:5008'));
app.use('/chatting', proxy('http://localhost:5005'));
app.use(
  '/admin',
  proxy('http://localhost:5004', {
    limit: '100mb',
  })
);
app.use('/order', proxy('http://localhost:5003'));
app.use('/product', proxy('http://localhost:5002'));
app.use('/seller', proxy('http://localhost:5006'));
app.use('/', proxy('http://localhost:5001'));

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

server.on('error', console.error);
