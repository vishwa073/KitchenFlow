import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { socket } from "./socket";

type SocketProviderProps = {
  children: React.ReactNode;
};

export default function SocketProvider({
  children,
}: SocketProviderProps) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function connectSocket() {
      if (!isLoaded || !isSignedIn) {
        socket.disconnect();
        return;
      }

      const token = await getToken();

      if (cancelled || !token) {
        return;
      }

      socket.auth = { token };
      socket.connect();
    }

    void connectSocket();

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [isLoaded, isSignedIn, getToken]);

  return <>{children}</>;
}