
import mongoose from 'mongoose';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import config from './app/config';
import { setSocketServerInstance } from './app/sockets';

const server = http.createServer(app); // ✅ Ensure shared server for both Express & Socket.IO

async function main() {
  try {
    // Database connection
    await mongoose.connect(config.database_url as string);
    console.log('✅ Connected to MongoDB');

    // Start server
    server.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
    });

    // --- SOCKET.IO CONFIG ---
    const allowedOrigins = [
      'http://localhost:3000',
      config.client_url,
      'https://thelawapp.netlify.app',
    ].filter(Boolean) as string[];

    const io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
      transports: ['websocket', 'polling'], // 🔒 Ensure fallback transport
    });

    // Global Socket.IO instance
    setSocketServerInstance(io);

    // Optional: Handle socket connections
    io.on('connection', (socket) => {
      console.log('🟢 New socket connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('🔴 Socket disconnected:', socket.id);
      });
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

main();

// --- GLOBAL ERROR HANDLING ---

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('❗ Unhandled Rejection:', reason);
  shutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❗ Uncaught Exception:', err);
  shutdown();
});

// Graceful shutdown
function shutdown() {
  console.log('⛔ Shutting down server...');
  server.close(() => {
    process.exit(1);
  });
}









//  ------- old configaration ------------------


// import mongoose from 'mongoose';
// import http from 'http';
// import { Server as SocketIOServer } from 'socket.io';
// import app from './app';
// import config from './app/config';
// import { setSocketServerInstance } from './app/sockets';

// const server = http.createServer(app); // ✅ Ensure shared server for both Express & Socket.IO

// async function main() {
//   try {
//     // Database connection
//     await mongoose.connect(config.database_url as string);
//     console.log('✅ Connected to MongoDB');

//     // Start server
//     server.listen(config.port, () => {
//       console.log(`🚀 Server is running on port ${config.port}`);
//     });

//     // --- SOCKET.IO CONFIG ---
//     const allowedOrigins = [
//       'http://localhost:3000',
//       config.client_url,
//       'https://thelawapp.netlify.app',
//     ].filter(Boolean) as string[];

//     const io = new SocketIOServer(server, {
//       cors: {
//         origin: allowedOrigins,
//         credentials: true,
//       },
//       transports: ['websocket', 'polling'], // 🔒 Ensure fallback transport
//     });

//     // Global Socket.IO instance
//     setSocketServerInstance(io);

//     // Optional: Handle socket connections
//     io.on('connection', (socket) => {
//       console.log('🟢 New socket connected:', socket.id);

//       socket.on('disconnect', () => {
//         console.log('🔴 Socket disconnected:', socket.id);
//       });
//     });

//   } catch (err) {
//     console.error('❌ Failed to start server:', err);
//     process.exit(1);
//   }
// }

// main();

// // --- GLOBAL ERROR HANDLING ---

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (reason) => {
//   console.error('❗ Unhandled Rejection:', reason);
//   shutdown();
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.error('❗ Uncaught Exception:', err);
//   shutdown();
// });

// // Graceful shutdown
// function shutdown() {
//   console.log('⛔ Shutting down server...');
//   server.close(() => {
//     process.exit(1);
//   });
// }



// server = app.listen(config.port, () => {
//       console.log(`app is listening on port ${config.port}`);
//     });