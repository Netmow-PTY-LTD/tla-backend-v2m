
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




export const registerChatEvents = (socket: Socket, io: Server) => {
  socket.on('send_message', (message) => {
    console.log('📨 Message received:', message);
    io.emit('receive_message', message); // broadcast to all
  });
};







export const registerSocketEvents = (socket: Socket, io: Server) => {
  // Join user-specific room
  socket.on('join_user_room', (userId: string) => {
    socket.join(userId);
    console.log(`✅ User joined room: ${userId}`);
  });

  // Join response room
  socket.on('join_response_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`✅ Joined response room: ${roomId}`);
  });

  // Sample backend event to emit a notification
  socket.on('send_notification', ({ toUserId, text }) => {
    io.to(toUserId).emit('notification', { text });
    console.log(`🔔 Sent notification to ${toUserId}:`, text);
  });

  // Sample backend event to emit response to room
  socket.on('send_response_room_message', ({ roomId, text }) => {
    io.to(roomId).emit('response_room_message', { text });
    console.log(`💬 Sent response to room ${roomId}:`, text);
  });
};
