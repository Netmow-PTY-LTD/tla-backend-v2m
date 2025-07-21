
import { Server } from 'socket.io';
import handleConnection from './coneectionHandler';



export const initializeSockets = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);
    handleConnection(socket, io);
  });
};
