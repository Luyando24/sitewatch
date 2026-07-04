import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef({});

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Re-attach any registered listeners
    Object.entries(listenersRef.current).forEach(([event, cb]) => {
      socket.on(event, cb);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const on = (event, callback) => {
    listenersRef.current[event] = callback;
    if (socketRef.current) {
      socketRef.current.off(event);
      socketRef.current.on(event, callback);
    }
  };

  const off = (event) => {
    delete listenersRef.current[event];
    if (socketRef.current) socketRef.current.off(event);
  };

  return { socket: socketRef.current, connected, on, off };
}
