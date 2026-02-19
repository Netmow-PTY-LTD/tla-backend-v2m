
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import router from './app/routes';
import config from './app/config';
import apiNotFound from './app/middlewares/apiNotFound';
import { logServerInfo } from './app/utils/serverInfo';
import { userSocketsMap } from './app/sockets';
import firmRoute from './app/routes/firmRoute';
import bodyParser from 'body-parser';
import { stripeWebhookHandler } from './app/module/CreditPayment/stripeWebhookHandler';


// Create Express app
const app: Application = express();

//  payment method

// IMPORTANT: Do not use express.json() before webhook route!
// app.use('/api/payment', paymentRoutes);

app.post(
  '/webhook',
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    Promise.resolve(stripeWebhookHandler(req, res))
      // .then(() => undefined)
      .catch(next);
  }
);



// Middlewares
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  `${config.client_url}`,
  `${config.firm_client_url}`,
  'https://thelawapp.netlify.app',
  'https://company-thelawapp.netlify.app',
  'https://stag.thelawapp.com.au',
  'https://company.thelawapp.com.au',

];





app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);




// Routes


app.use('/api/v1', router);
app.use('/api/firm', firmRoute);

app.get('/server-info', (req: Request, res: Response) => {
  const info = logServerInfo();
  res.status(200).json({
    success: true,
    message: 'Server information retrieved successfully',
    data: info,
  });
});

app.get('/online-users', async (_req: Request, res: Response) => {
  const onlineUserIds = Array.from(userSocketsMap.keys());

  res.status(200).json({
    success: true,
    message: 'Online users fetched successfully.',
    data: {
      count: onlineUserIds.length,
      users: onlineUserIds,
    },
  });


});


// ----------------------------------    for data insert   api ---------------------------------------------



app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to TLA Backend  2.04!');
});

app.use(globalErrorHandler);
app.use(apiNotFound);

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server using HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Export everything for use in `server.ts`
export { app, server, io };
