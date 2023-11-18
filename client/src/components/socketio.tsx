"use client";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";

const SocketIOContext = createContext<Socket | undefined>(undefined);

export default function SocketIOProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const [socket, setSocket] = useState<Socket>();
  useEffect(() => {
    const sio = io(process.env.NEXT_PUBLIC_SERVER_BASE_URL || "", {
      autoConnect: true,
      withCredentials: true,
    });
    setSocket(sio);
  }, []);
  return (
    <SocketIOContext.Provider value={socket}>
      {children}
    </SocketIOContext.Provider>
  );
}

export function useSocket() {
  const socket = useContext(SocketIOContext);
  return socket;
}
