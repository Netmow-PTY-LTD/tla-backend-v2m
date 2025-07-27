
import { Server, Socket } from 'socket.io';
import { registerChatEvents, registerNotificationEvents } from './events';


let io: Server;

export const handleConnection = (socket: Socket, io: Server) => {
  registerChatEvents(socket, io);
  registerNotificationEvents(socket, io);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
};





export const initializeSockets = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);
    handleConnection(socket, io);
  });
};




export const setSocketServerInstance = (ioInstance: Server) => {
  io = ioInstance;
};

export { io };
