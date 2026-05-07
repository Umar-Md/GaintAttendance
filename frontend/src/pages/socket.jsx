import { io } from "socket.io-client";
import { backendURI } from "../mainApi";

const socket = io(backendURI, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  upgrade: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
});

export default socket;