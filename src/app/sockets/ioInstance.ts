

import { Server } from "socket.io";

let io: Server;

export const setSocketServerInstance = (ioInstance: Server) => {
  io = ioInstance;
};

export { io };
