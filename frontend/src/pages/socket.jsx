import { io } from "socket.io-client";
import { socketURI } from "../mainApi";

const resolveSocketOptions = (url) => {
  if (typeof window === "undefined") return {};

  const parsed = new URL(url, window.location.origin);
  const isApiPrefix = parsed.pathname && parsed.pathname !== "/";

  return {
    path: isApiPrefix ? `${parsed.pathname.replace(/\/+$/, "")}/socket.io` : "/socket.io",
  };
};

const socket = io(socketURI, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;