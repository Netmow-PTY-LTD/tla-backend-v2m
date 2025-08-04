import { Server, Socket } from 'socket.io';
import { registerChatEvents, registerNotificationEvents, registerSocketEvents } from './event';
import { setUserOnlineStatus } from '../module/Auth/utils/auth.utils';

let io: Server;
const onlineUsersMap = new Map<string, string>(); // socketId => userId

// Map<userId, Set<socketId>>
const userSocketsMap = new Map<string, Set<string>>();

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

// export const initializeSockets = (ioInstance: Server) => {
//   ioInstance.on('connection', async (socket) => {
//     console.log(`🔌 New client connected: ${socket.id}`);
//     // const userId = socket.handshake.query.userId;

//     const rawUserId = socket.handshake.query.userId;
//     const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
//     if (userId) {
//       socket.join(`user:${userId}`);
//       onlineUsersMap.set(socket.id, userId);
//       console.log(`✅ User ${userId} connected`);
//       console.log(`✅ onlineUsersMap`,onlineUsersMap);

//       await setUserOnlineStatus(userId, true);
//       // emit 
//       socket.emit("userOnline", { userId });
//     }

//     // Join responseId room
//     socket.on("join-response", (responseId) => {
//       socket.join(`response:${responseId}`);
//       console.log(`User joined response:${responseId}`);
//     });


//     // DISCONNECT handling
//     socket.on("disconnect", async () => {
//       const uid = onlineUsersMap.get(socket.id);
//       if (uid) {
//         await setUserOnlineStatus(uid, false);
//         onlineUsersMap.delete(socket.id);
//         console.log(`❌ User ${uid} disconnected`);
//         // 4. Emit to everyone
//       ioInstance.emit("userOffline", { userId });
//       } else {
//         console.log(`❌ Unknown user disconnected: ${socket.id}`);
//       }
//     });

//     // Optional event registration
//     // handleConnection(socket, ioInstance);
//   });
//   setSocketServerInstance(ioInstance);
// };

export const initializeSockets = (ioInstance: Server) => {
  ioInstance.on("connection", async (socket: Socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    const rawUserId = socket.handshake.query.userId;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (userId) {
      socket.join(`user:${userId}`);
      onlineUsersMap.set(socket.id, userId);

      const existingSockets = userSocketsMap.get(userId) || new Set();
      existingSockets.add(socket.id);
      userSocketsMap.set(userId, existingSockets);

      // If this is the first socket, set user online
      if (existingSockets.size === 1) {
        await setUserOnlineStatus(userId, true);
        ioInstance.emit("userOnline", { userId });
        console.log(`✅ User ${userId} is now ONLINE`);
      }

      console.log("📌 onlineUsersMap:", onlineUsersMap);
      console.log("📌 userSocketsMap:", userSocketsMap);
    }

    // Handle response room join
    socket.on("join-response", (responseId: string) => {
      socket.join(`response:${responseId}`);
      console.log(`👥 User joined response:${responseId}`);
    });

    // Listen for watch-users to send current online statuses
    socket.on("watch-users", (watchUserIds: string[]) => {
      watchUserIds.forEach((watchId) => {
        if (userSocketsMap.has(watchId)) {
          socket.emit("userOnline", { userId: watchId });
        }
      });
    });



    // Handle disconnect
    socket.on("disconnect", async () => {
      const uid = onlineUsersMap.get(socket.id);
      if (uid) {
        onlineUsersMap.delete(socket.id);

        const socketSet = userSocketsMap.get(uid);
        socketSet?.delete(socket.id);

        // If user has no more sockets, mark offline
        if (!socketSet || socketSet.size === 0) {
          userSocketsMap.delete(uid);
          await setUserOnlineStatus(uid, false);
          ioInstance.emit("userOffline", { userId: uid });
          console.log(`❌ User ${uid} is now OFFLINE`);
        }
      } else {
        console.log(`❌ Unknown user disconnected: ${socket.id}`);
      }
    });
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



export { userSocketsMap };
