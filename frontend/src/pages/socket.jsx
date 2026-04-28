import { io } from "socket.io-client";
import { backendURI } from "../mainApi";

const socket = io(backendURI, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
