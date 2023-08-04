import { io } from "socket.io-client";

class SocketIO {
  public static socket = io(`${import.meta.env.VITE_PUBLIC_URI}`, {
    withCredentials: true,
    extraHeaders: {
      "react-client": "react-client",
    },
  });
}

export default SocketIO.socket;