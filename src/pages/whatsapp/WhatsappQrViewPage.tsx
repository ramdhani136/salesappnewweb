import { useEffect, useState } from "react";
import { SocketIO } from "../../utils";
import { PuffLoader, RotateLoader } from "react-spinners";

const WhatsappQrViewPage: React.FC<any> = ({ props }) => {
  const [qr, setQr] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [reset, setReset] = useState<boolean>(false);
  const [destroy, setDestroy] = useState<boolean>(false);
  const [resetTime, setResetTime] = useState<number>(1);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    SocketIO.emit("open", props.id);
    SocketIO.on("qr", (data) => {
      setQr(data);
    });
    SocketIO.on("reset", (data) => {
      setResetTime(0);
      setReset(false);
      const id = setInterval(() => {
        setReset(true);
        clearInterval(id);
      }, data);
    });
    SocketIO.on("message", (data) => {
      setStatus(data);
    });
    SocketIO.on("loading", (data) => {
      setLoading(data);
    });
    SocketIO.on("getuserdata", (data) => {
      console.log(data);
      setUserData(data);
    });

    return () => {
      // SocketIO.emit("close", "client1");
    };
  }, []);

  useEffect(() => {
    if (!reset) {
      const id = setInterval(() => {
        setReset(true);
        clearInterval(id);
      }, 10000);
      setResetTime(1);
    }

    return () => {
      SocketIO.emit("close", props.id);
      props.onClose();
    };
  }, []);

  useEffect(() => {
    if (resetTime < 10) {
      const id = setInterval(() => {
        setResetTime(resetTime + 1);
        clearInterval(id);
      }, 1000);
    }
  }, [resetTime]);

  return (
    <div className="w-[800px] h-[400px] m-5 rounded-md bg-white flex flex-col">
      <div className="flex-1 flex flex-row ">
        <div className="flex-1 p-6 ">
          {status === "Client is connected!" || status === "Session Saved!" ? (
            <div className="flex -ml-5">
              {userData != null && (
                <>
                  <img
                    className="w-[50px] rounded-full"
                    src={userData.img ?? ""}
                    alt="pp"
                  />
                  <div className="ml-2">
                    <b>{userData.name}</b>
                    <h4 className="text-sm font-semibold text-gray-700 italic">
                      +{userData.phone}
                    </h4>
                  </div>
                  {(status == "Client is connected!" ||
                    status === "Session Saved!") &&
                    !loading && (
                      <h4
                        onClick={() => {
                          SocketIO.emit("logout", props.id);
                        }}
                        className="border h-7 ml-2 mt-3 cursor-pointer rounded-md py-1 px-2 mr-2 bg-red-400  hover:bg-red-500 font-semibold duration-100 text-white text-[0.8em]"
                      >
                        Disconnect
                      </h4>
                    )}
                </>
              )}
            </div>
          ) : (
            <>
              <h3 className="text-md">
                Untuk mengirim dan menerima pesan,
                <br />
                Anda harus scan Scan Qrcode untuk menghubungkan Server kami ke
                Whatsapp
              </h3>
              <br />
              <ul className="text-md">
                <li>
                  1. Buka aplikasi <b>WhatsApp</b> di ponsel Anda
                </li>
                <li>
                  2. Pilih <b>menu</b> atau <b>Setelan</b> dan pilih{" "}
                  <b>Perangkat Tertaut</b>
                </li>
                <li>3. Scan Qrcode dan tunggu hingga terhubung</li>
                <li>
                  4. Tetap hidupkan ponsel Anda dan sambungkan ke internet
                </li>
              </ul>
            </>
          )}
        </div>
        <div className="w-[270px] border border-grey-200 rounded-md my-6 mr-5 flex flex-col ">
          {!loading && qr && <img className="flex-1" src={qr} alt="qrcode" />}
          {(status === "Client is connected!" ||
            status === "Session Saved!") && (
            <div className="w-full h-full flex justify-center items-center">
              <PuffLoader
                color="#ccc"
                loading={true}
                // cssOverride={override}
                size={70}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          )}

          {loading && (
            <div className="w-full  h-full flex justify-center items-center">
              <RotateLoader
                color="#ccc"
                loading={true}
                // cssOverride={override}
                size={10}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          )}

          <h3 className="text-center text-md  mb-3 text-gray-500 italic font-semibold text-[0.9em]">
            {status}
          </h3>
        </div>
      </div>
      <ul className="flex items-center justify-center w-full  py-2  h-[70px] ">
        {status !== "Client is connected!" &&
          status !== "Session Saved!" &&
          (!loading || resetTime > 0) &&
          status !== "Connecting .." && (
            <li
              onClick={() => {
                if (reset) {
                  SocketIO.emit("qrrefresh", props.id);
                  setReset(false);
                  const id = setInterval(() => {
                    setReset(true);
                    clearInterval(id);
                  }, 10000);
                  setResetTime(1);
                }
              }}
              className={`border cursor-pointer ${
                !reset && "opacity-50 cursor-progress"
              } rounded-md py-1 px-2 mr-2 flex items-center justify-center bg-gray-800 font-semibold text-white text-sm`}
            >
              <h4>Refresh Qr</h4>
              {!reset && (
                <h5 className="text-[0.9em] ml-[1px] mt-[2px]">
                  ({resetTime})
                </h5>
              )}
            </li>
          )}
      </ul>
    </div>
  );
};

export default WhatsappQrViewPage;
