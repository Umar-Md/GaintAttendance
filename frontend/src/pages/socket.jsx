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

// Debug logging to help diagnose connection/transport issues
try {
  socket.on("connect", () => {
    console.log("[socket] connected, id:", socket.id);
    try {
      console.log("[socket] transport:", socket.io.engine.transport.name);
    } catch (e) {
      // ignore if engine not available yet
    }
  });

  socket.on("connect_error", (err) => {
    console.error("[socket] connect_error:", err);
  });

  socket.on("disconnect", (reason) => {
    console.warn("[socket] disconnected:", reason);
  });

  socket.io?.engine?.on?.("upgrade", () => {
    try {
      console.log("[socket] transport upgraded to:", socket.io.engine.transport.name);
    } catch (e) {}
  });
} catch (e) {
  // defensive - don't break app if socket internals change
}

export default socket;