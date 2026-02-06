
import mongoose from 'mongoose';
import config from './app/config';
import { server, io } from './app';
import { initializeSockets, setSocketServerInstance } from './app/sockets';
import { envConfigLoader } from './app/module/EnvConfig/envConfig.loader';



async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log('✅ Connected to MongoDB');

    // ADD THIS LINE: Initialize dynamic configs
    await envConfigLoader.initialize();
    // Set and initialize sockets
    setSocketServerInstance(io);
    initializeSockets(io);

    // Start server
    // server.listen(config.port, () => {

    //   console.log(`🚀 Server running on port ${config.port}`);
    // });

    // Determine environment
    const isDev = process.env.NODE_ENV === "development";

    // Bind host only in dev (0.0.0.0), safe in production (127.0.0.1)
    const host = isDev ? "0.0.0.0" : "127.0.0.1";

    // Start server with type-safe options
    server.listen(
      {
        port: config.port,
        host,
      },
      () => {
        console.log(
          `🚀 Server running => http://${host}:${config.port}  [${isDev ? "DEV" : "PROD"} MODE]`
        );
      }
    );


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
