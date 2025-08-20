
import mongoose from 'mongoose';
import config from './app/config';
import { server, io } from './app';
import { initializeSockets, setSocketServerInstance } from './app/sockets';

import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http"; // assuming you're using HTTP server

// const onlineUsers: Record<string, Set<string>> = {}; // userId -> Set of socketIds


// ----------------------- mv code -----------------

// export const setupSocket = (server: HttpServer) => {


//   const allowedOrigins = [
//     'http://localhost:3000',
//     `${config.client_url}`,
//     'https://thelawapp.netlify.app',
//   ];

//   const io = new Server(server, {
//     cors: {
//       origin: allowedOrigins,
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket: Socket) => {
//     const userId = socket.handshake.query.userId as string;

//     if (!userId) {
//       socket.disconnect();
//       return;
//     }

//     if (!onlineUsers[userId]) {
//       onlineUsers[userId] = new Set();
//       io.emit("userOnline", { userId });
//     }

//     onlineUsers[userId].add(socket.id);

//     socket.on("disconnect", () => {
//       onlineUsers[userId].delete(socket.id);
//       if (onlineUsers[userId].size === 0) {
//         delete onlineUsers[userId];
//         io.emit("userOffline", { userId });
//       }
//     });
//   });

//   return io;
// };




async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log('✅ Connected to MongoDB');

    // Set and initialize sockets
    setSocketServerInstance(io);
    initializeSockets(io);

    // Start server
    server.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

main();

// Graceful shutdown handling
process.on('unhandledRejection', (reason) => {
  console.error('❗ Unhandled Rejection:', reason);
  shutdown();
});

process.on('uncaughtException', (err) => {
  console.error('❗ Uncaught Exception:', err);
  shutdown();
});

function shutdown() {
  console.log('⛔ Shutting down...');
  server.close(() => process.exit(1));
}
