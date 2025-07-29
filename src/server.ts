
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
    // setSocketServerInstance(io);

    // Optional: Handle socket connections
    // io.on('connection', (socket) => {
    //   console.log('🟢 New socket connected:', socket.id);

    //   socket.on('disconnect', () => {
    //     console.log('🔴 Socket disconnected:', socket.id);
    //   });
    // });


    //  ------------- event add there -------------
    const connectedUsers = new Map();
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user registration
      socket.on('register-user', (userId) => {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} registered with socket ${socket.id}`);

        // Send welcome message to this specific user
        socket.emit('notification', `Welcome ${userId}! You are connected.`);

        // Broadcast user list update to all users
        io.emit('users-update', Array.from(connectedUsers.keys()));
      });

      // Listen for user-specific messages
      socket.on('send-user-message', (data) => {
        const { targetUserId, message } = data;
        const targetSocketId = connectedUsers.get(targetUserId);

        if (targetSocketId) {
          // Send to specific user
          io.to(targetSocketId).emit('notification', `From ${socket.userId}: ${message}`);
          // Send confirmation to sender
          socket.emit('notification', `Message sent to ${targetUserId}: ${message}`);
        } else {
          // User not found
          socket.emit('notification', `User ${targetUserId} is not connected`);
        }
      });

      // Listen for broadcast messages
      socket.on('send-broadcast', (message) => {
        io.emit('notification', `Broadcast from ${socket.userId}: ${message}`);
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected`);
          // Broadcast user list update to all users
          io.emit('users-update', Array.from(connectedUsers.keys()));
        }
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