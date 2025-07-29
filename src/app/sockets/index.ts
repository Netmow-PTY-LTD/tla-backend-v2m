import { Server, Socket } from 'socket.io';
import { registerChatEvents, registerNotificationEvents, registerSocketEvents } from './event';

let io: Server;

//  ------------  connection event ------------------------------
export const handleConnection = (socket: Socket, io: Server) => {
  registerChatEvents(socket, io);
  registerNotificationEvents(socket, io);
  registerSocketEvents(socket, io)

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
};



//  -----------------------   Initial Socket -------------------------------

export const initializeSockets = (ioInstance: Server) => {
  ioInstance.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);
    const userId = socket.handshake.query.userId;
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


    // handleConnection(socket, ioInstance);
  });
  setSocketServerInstance(ioInstance);
};


export const setSocketServerInstance = (ioInstance: Server) => {
  io = ioInstance;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO server not initialized!');
  }
  return io;
};
