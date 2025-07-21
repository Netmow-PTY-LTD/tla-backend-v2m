
import { Server, Socket } from 'socket.io';

export const registerNotificationEvents = (socket: Socket, io: Server) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`📦 Joined room: ${roomId}`);
  });

  socket.on('notify', ({ roomId, message }) => {
    io.to(roomId).emit('notification', message);
  });
};
