import { io } from "socket.io-client";

const socket = io("https://attendance.gaintclout.com", {
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