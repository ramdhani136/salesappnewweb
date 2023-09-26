import React, { useEffect } from "react";
import { SocketIO } from "../../utils";

const WhatsappAccountPage = () => {
  useEffect(() => {
    // SocketIO.emit("get qr", "client1");
    // SocketIO.on("message", (data) => {
    //   console.log(data);
    // });
  }, []);

  return <div>WhatsappAccountPage</div>;
};

export default WhatsappAccountPage;
