import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import { initializeSockets } from './app/sockets';
import { setSocketServerInstance } from './app/sockets/ioInstance';
let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });

    // ------------------------------------ Socket.IO setup  -------------------------

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
    });

    setSocketServerInstance(io);        // Share io globally
    initializeSockets(io);              // Initialize connection handling

  } catch (err) {
    console.log(err);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
