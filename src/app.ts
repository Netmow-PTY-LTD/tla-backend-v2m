import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import router from './app/routes';
import config from './app/config';
import apiNotFound from './app/middlewares/apiNotFound';
import { logServerInfo } from './app/utils/serverInfo';

const app: Application = express();
//parsers
app.use(express.json());
app.use(cookieParser());

// app.use(
//   cors({
//     origin: [`${config.client_url}`, 'http://localhost:3000'],
//     credentials: true,
//   }),
// );

const allowedOrigins = [
  'http://localhost:3000', // local dev
  `${config.client_url}`, // deployed frontend
  'https://thelawapp.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      // Allow all origins
      if (allowedOrigins.includes(origin)) {
        // Allow web origins you trust
        return callback(null, true);
      }
      // Reject unknown origins (optional: allow all for full open API)
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);




// application routes
app.use('/api/v1', router);

app.get('/server-info', (req: Request, res: Response) => {
  const info = logServerInfo();
  res.status(200).json({
    success: true,
    message: 'Server information retrieved successfully',
    data: info,
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to TLA Backend 3.0');
});

app.use(globalErrorHandler);

//Not Found
app.use(apiNotFound);

export default app;
