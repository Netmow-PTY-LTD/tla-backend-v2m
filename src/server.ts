
import mongoose from 'mongoose';
import config from './app/config';
import { app, server, io } from './app';
import { initializeSockets, setSocketServerInstance } from './app/sockets';

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
