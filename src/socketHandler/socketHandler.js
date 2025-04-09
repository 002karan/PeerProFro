// src/socketHandler/socketHandler.js

import { io } from "socket.io-client";



// Create a single socket instance
export const socket = io(`${import.meta.env.VITE_SERVER_BASE_URL}`, {
  transports: ["websocket"],
  withCredentials: true,
});




