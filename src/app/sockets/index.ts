import { Server, Socket } from 'socket.io';
import { registerChatEvents, registerNotificationEvents, registerSocketEvents } from './event';
import { setUserOnlineStatus } from '../module/Auth/utils/auth.utils';

let io: Server;
const onlineUsersMap = new Map<string, string>(); // socketId => userId
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
  ioInstance.on('connection', async (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);
    // const userId = socket.handshake.query.userId;

    const rawUserId = socket.handshake.query.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
    if (userId) {
      socket.join(`user:${userId}`);
      onlineUsersMap.set(socket.id, userId);
      console.log(`✅ User ${userId} connected`);
      console.log(`✅ onlineUsersMap`,onlineUsersMap);

      await setUserOnlineStatus(userId, true);
    }

    // Join responseId room
    socket.on("join-response", (responseId) => {
      socket.join(`response:${responseId}`);
      console.log(`User joined response:${responseId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ User ${userId} disconnected`);
    });
    // DISCONNECT handling
    socket.on("disconnect", async () => {
      const uid = onlineUsersMap.get(socket.id);
      if (uid) {
        await setUserOnlineStatus(uid, false);
        onlineUsersMap.delete(socket.id);
        console.log(`❌ User ${uid} disconnected`);
      } else {
        console.log(`❌ Unknown user disconnected: ${socket.id}`);
      }
    });

    // Optional event registration
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




