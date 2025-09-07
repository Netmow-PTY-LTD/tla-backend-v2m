
import { Server, Socket } from 'socket.io';
import { ResponseWiseChatMessage } from '../module/View/models/chatMessage.model';
import { createNotification } from '../module/Notification/notification.utils';


export const registerNotificationEvents = (socket: Socket, io: Server) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`📦 Joined room: ${roomId}`);
  });

  socket.on('notify', ({ roomId, message }) => {
    io.to(roomId).emit('notification', message);
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






// export const registerChatEvents = (socket: Socket, io: Server) => {
//   // Join a response room
//   socket.on("join-response", (responseId: string) => {
//     socket.join(`response:${responseId}`);
//     console.log(`👥 User joined response:${responseId}`);
//   });

//   // Join a generic chat room
//   socket.on("joinRoom", ({ responseId, userId }) => {
//     socket.join(responseId);
//     console.log(`${userId} joined room: ${responseId}`);
//   });

//   // Send a chat message
//   socket.on("message", ({ responseId, from, message }) => {
//     io.to(responseId).emit("message", { responseId, from, message });
//   });

//   // Future: Typing indicator
//   socket.on("typing", ({ responseId, userId }) => {
//     socket.to(responseId).emit("typing", { userId });
//   });

//   // Future: Message read receipt
//   socket.on("message-read", ({ responseId, messageId, userId }) => {
//     io.to(responseId).emit("message-read", { responseId, messageId, userId });
//   });
// };





export const registerChatEvents = (socket: Socket, io: Server) => {

  // ---------- Allow joining any room (global or response) ----------
  socket.on('join-room', (roomName: string) => {
    if (!roomName) return;
    socket.join(roomName);
    console.log(`👥 Socket ${socket.id} joined room: ${roomName}`);
  });








  // ✅ Join a response chat room
  socket.on("joinRoom", async ({ responseId, userId }) => {
    if (!responseId || !userId) return;
    const roomName = `response:${responseId}`;
    socket.join(roomName);
    console.log(`👥 User ${userId} joined room: ${roomName}`);

    // Fetch unread messages for this user
    try {
      const unreadMessages = await ResponseWiseChatMessage.find({
        responseId,
        readBy: { $ne: userId },
      }).populate({
        path: "from",
        populate: { path: "profile", select: "name profilePicture" },
      });

      if (unreadMessages.length > 0) {
        socket.emit("unread-messages", unreadMessages);
      }
    } catch (err) {
      console.error("❌ Failed to fetch unread messages", err);
    }


  });


  // ✅ Send and save a chat message
  socket.on("message", async ({ responseId, from, message, to }) => {
    if (!responseId || !from || !message?.trim()) return;

    try {
      // Save to DB
      let savedMessage = await ResponseWiseChatMessage.create({
        responseId,
        from,
        to,
        message,
      });


      // Populate after creation
      // savedMessage = await savedMessage.populate({
      //   path: 'from',
      //   populate: {
      //     path: 'profile',
      //     select: 'name profilePicture',
      //   },
      // });




      savedMessage = await savedMessage.populate([
        {
          path: 'from',
          populate: {
            path: 'profile',
            select: 'name profilePicture',
          },
        },
        {
          path: 'to',
          populate: {
            path: 'profile',
            select: 'name profilePicture',
          },
        },

      ]);



      const roomName = `response:${responseId}`;
      io.to(roomName).emit("message", savedMessage);

      // Emit to global-room for toaster
      io.to('global-room').emit(`toast:${to}`, savedMessage);
      console.log('toast:${to }', `toast:${to}`)



      //   notifcation create  -----------------


      // 4. Create notification for the lawyer
      await createNotification({
        userId: to,
        toUser: from,
        title: "You have received a new message",
        message: message,
        module: 'response',
        type: 'create',
        link: `/lawyer/dashboard/my-responses?responseId=${responseId}`,

      })

      // 📡 --------------- Emit socket notifications -----------------------------------------
      io.to(`user:${to}`).emit('notification', {
        userId: to,
        toUser: from,
        title: "You have received a new message",
        message: message,
        module: 'response',
        type: 'create',
        link: `/lawyer/dashboard/my-responses?responseId=${responseId}`,

      });







    } catch (err) {
      console.error("❌ Failed to save message", err);
    }
  });

  // ✅ Typing indicator
  socket.on("typing", ({ responseId, userId }) => {
    if (!responseId || !userId) return;
    socket.to(`response:${responseId}`).emit("typing", { userId });
  });

  // ✅ Message read receipt
  socket.on("message-read", async ({ responseId, messageId, userId }) => {

    if (!responseId || !messageId || !userId) return;

    try {
      await ResponseWiseChatMessage.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: userId }, // prevent duplicates
      });

      // Emit event to everyone in the room
      io.to(`response:${responseId}`).emit("message-read", {
        responseId,
        messageId,
        userId
      });
    } catch (err) {
      console.error("❌ Failed to mark message as read", err);
    }




  });
};
