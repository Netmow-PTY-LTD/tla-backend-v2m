
import { Server, Socket } from 'socket.io';

export const registerChatEvents = (socket: Socket, io: Server) => {
  socket.on('send_message', (message) => {
    console.log('📨 Message received:', message);
    io.emit('receive_message', message); // broadcast to all
  });
};
