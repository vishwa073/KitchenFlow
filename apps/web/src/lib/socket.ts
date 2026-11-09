
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("KitchenFlow Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("KitchenFlow Socket connection error:", error.message);
});
