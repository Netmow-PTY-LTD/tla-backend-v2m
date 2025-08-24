
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
import ServiceWiseQuestion from './app/module/Question/models/ServiceWiseQuestion.model';


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


// ----------------------------------    for data insert   api ---------------------------------------------


// GET /seed?countryId=xxx&serviceId=yyy
// app.get('/seed', async (req: Request, res: Response) => {
//   try {
//     const countryId = req.query.countryId as string | undefined;
//     const serviceId = req.query.serviceId as string | undefined;

//     // Build filter object dynamically
//     const filter: Record<string, string> = {};
//     if (countryId) filter.countryId = countryId;
//     if (serviceId) filter.serviceId = serviceId;

//     // Find questions based on filter
//     const questions = await ServiceWiseQuestion.find(filter);

//     if (!questions.length) {
//       return res.status(404).json({ message: 'No questions found' });
//     }

//     res.status(200).json({ success: true, data: questions });
//   } catch (error) {
//     console.error('Error fetching questions:', error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// });




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
