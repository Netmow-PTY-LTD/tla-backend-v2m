
import { Server, Socket } from 'socket.io';
import { registerNotificationEvents } from './events/notificationEvents';
import { registerChatEvents } from './events/chatEvents';



const handleConnection = (socket: Socket, io: Server) => {
  registerChatEvents(socket, io);
  registerNotificationEvents(socket, io);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
};

export default handleConnection;
