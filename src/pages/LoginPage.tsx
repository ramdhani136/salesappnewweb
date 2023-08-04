import React, { useEffect, useRef, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import axios from "axios";
import Swal from "sweetalert2";
import logo from "../assets/images/icon.png";

import { useNavigate } from "react-router-dom";
import { LocalStorage, LocalStorageType, Meta } from "../utils";
import { LoadingComponent } from "../components/moleculs";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const metaData = {
    title: "Login - Ekatunggal Tunas Mandiri",
    description: "Login page ekatunggal tunas mandiri",
  };

  interface IValue {
    username?: string;
    password?: string;
  }

  const [value, setValue] = useState<IValue>({ username: "", password: "" });
  const [showPass, setShowPass] = useState<boolean>(true);

  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (LocalStorage.loadData(LocalStorageType.TOKEN)) {
      navigate("/");
    }
    usernameRef.current?.focus();
  }, []);



  const handleLogin = async (event: any) => {
    setIsloading(true);
    const uri = `http://localhost:5000/users/login`;
    event.preventDefault();
    try {
      const login: any = await axios.post(
        uri,
        {
          username: value.username,
          password: value.password,
        },
        {
          withCredentials: true,
        }
      );
      LocalStorage.saveData(LocalStorageType.TOKEN, login.data.token);
      await Swal.fire({
        position: "center",
        icon: "success",
        title: "Login successfully!",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/");
      window.location.reload();
    } catch (err: any) {
      setIsloading(false);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err.response.data.msg,
      });
    }
  };

  return (
    <>
      {Meta(metaData)}
      <div className="flex bg-red-500 w-full h-screen justify-around flex-col items-center">
        <div className="md:w-[600px] w-[95%] md:h-[550px] h-auto pb-3 lg:w-[380px] lg:h-[410px] border border-red-700 bg-white flex flex-col rounded-lg items-center mt-10">
          {isLoading ? (
            <LoadingComponent />
          ) : (
            <div className="w-[95%] flex-[0.95] mt-5 border-1.5 border-gray-300 rounded-md ">
              <div className="flex justify-center mt-5 animate-bounce">
                <img className="w-1/4" src={logo} />
              </div>
              <h2
                className="text-xl p-4 font-bold text-[1.5em] lg:text-lg  -mt-14 "
              >
                Login
              </h2>
              <form
                className="flex flex-col text-[1.3em] lg:text-[1em] px-4 mb-3"
                onSubmit={handleLogin}
              >
                <label>Username</label>
                <input
                  ref={usernameRef}
                  onChange={(e) =>
                    setValue({ ...value, username: e.target.value })
                  }
                  className="border h-12 lg:h-10 px-2 mb-4 lg:mb-1"
                />
                <label>Password</label>
                <div className="flex items-center relative ">
                  {showPass ? (
                    <VisibilityIcon
                      className="right-2"
                      onClick={() => setShowPass(false)}
                      style={{
                        position: "absolute",
                        fontSize: "15px",
                        cursor: "pointer",
                        color: "#ddd",
                      }}
                    />
                  ) : (
                    <VisibilityOffIcon
                      className="right-2"
                      onClick={() => setShowPass(true)}
                      style={{
                        position: "absolute",
                        fontSize: "15px",
                        cursor: "pointer",
                        color: "#ddd",
                      }}
                    />
                  )}
                  <input
                    onChange={(e) =>
                      setValue({ ...value, password: e.target.value })
                    }
                    className="border h-12 lg:h-10  px-2 flex-1"
                    type={showPass ? "password" : "text"}
                  />
                </div>
                <button className="border mt-12 h-12 lg:h-12 border-black bg-gray-900 rounded-md text-white">
                  Login
                </button>
              </form>
            </div>
          )}
        </div>
        <div className="mt-24 text-lg text-center md:text-[1.5em] lg:text-sm text-white">
          &copy; (IT) PT. Ekatunggal Tunas Mandiri - 2022 (SOETM)
        </div>
      </div>
    </>
  );
};

export default LoginPage;
