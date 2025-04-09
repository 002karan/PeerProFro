import { io } from "socket.io-client";

let socket;

export const initSocket = () => {
  socket = io(import.meta.env.VITE_SERVER_BASE_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });
  return socket;
};

export const getSocket = () => socket;
