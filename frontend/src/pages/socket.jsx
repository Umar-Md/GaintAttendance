import { io } from "socket.io-client";
import { socketURI } from "../mainApi";

const socket = io(socketURI, {
  path: "/socket.io/",
  transports: ["websocket"],
  upgrade: false,
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
