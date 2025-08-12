
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


// Create Express app
const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  `${config.client_url}`,
  'https://thelawapp.netlify.app',
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

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to TLA Backend 1.0');
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
