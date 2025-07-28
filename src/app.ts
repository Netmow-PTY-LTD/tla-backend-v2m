import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import http from 'http'
import router from './app/routes';
import config from './app/config';
import apiNotFound from './app/middlewares/apiNotFound';
import { logServerInfo } from './app/utils/serverInfo';
import { Server } from "socket.io";

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


//  --------------------- socket --------------------------


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});



// Socket handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
    console.log("Socket connected:", socket.id, "userId:", socket.handshake.query.userId);
  console.log('socket connection data ===>',socket)
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`✅ User ${userId} connected`);
  }

  // Join responseId room
  socket.on("join-response", (responseId) => {
    socket.join(`response:${responseId}`);
    console.log(`User joined response:${responseId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User ${userId} disconnected`);
  });
});

// Sample API to trigger a notification
app.post("/api/notify", (req, res) => {
  const { toUserId, text, leadId, responseId } = req.body;
  const payload = { text, leadId, responseId, timestamp: Date.now() };

  io.to(`user:${toUserId}`).emit("notification", payload);
  if (responseId) {
    io.to(`response:${responseId}`).emit("response-update", payload);
  }

  res.json({ success: true });
});





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
