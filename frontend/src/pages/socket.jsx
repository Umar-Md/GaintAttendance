import { io } from "socket.io-client";
import { backendURI } from "../mainApi";

const socket = io(backendURI, {
  autoConnect: false,
  withCredentials: true,

  // FORCE WEBSOCKET
  transports: ["websocket"],

  upgrade: false,

  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,

  timeout: 20000,
});

export default socket;