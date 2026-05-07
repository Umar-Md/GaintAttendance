import { io } from "socket.io-client";
import { socketURI } from "../mainApi";

const socket = io(socketURI, {
  autoConnect: false,
  withCredentials: true,

  // allow polling first, then upgrade to websocket when possible
  transports: ["polling", "websocket"],
  upgrade: true,

  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,

  timeout: 20000,
});

export default socket;