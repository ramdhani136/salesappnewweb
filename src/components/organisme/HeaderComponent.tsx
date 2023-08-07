import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Avatar } from "@mui/material";
// import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { IconMenuHeader, SeacrhHeaderComponent } from "../moleculs";
import SettingsIcon from "@mui/icons-material/Settings";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import React, { useEffect, useState } from "react";
import { LocalStorage, LocalStorageType } from "../../utils";
import jwt_decode from "jwt-decode";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const HeaderComponent: React.FC = () => {
  const [data, setData] = useState<any>([]);
  const navigate = useNavigate();
  const getUser = async (): Promise<any> => {
    try {
      const userLogin = LocalStorage.getUser();

      const users = await GetDataServer(DataAPI.USERS).FINDONE(userLogin._id);

      setData(users.data);
    } catch (error: any) {
      Swal.fire(
        "Error!",
        `${
          error.response.status === 403
            ? "Access Denied"
            : error.response.data.msg ?? "Error Get data User"
        }`,
        "error"
      );
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div className="bg-white w-full h-auto py-2 pl-1 border-b flex flex-row sticky top-0 z-[58]  justify-end lg:justify-between  px-6 items-center  drop-shadow-sm">
      <div className="text-sm flex items-center ml-3">
        <SeacrhHeaderComponent />

        <IconMenuHeader Icon={NotificationsNoneIcon} title="notif" />
      </div>

      <div className="flex items-center">
        <Avatar
          alt={data.name}
          src={`${import.meta.env.VITE_PUBLIC_URI}/images/users/${data.img}`}
          sx={{ width: 35, height: 35 }}
          className={`mx-3 cursor-pointer`}
        />
        <div>
          <h4 className=" text-gray-600 text-md text-[0.87em] font-medium -mt-1">
            {data.name}
          </h4>
          <h5 className="font-normal text-md text-[0.76em] text-gray-400 -mt-1">
            @{data.username}
          </h5>
        </div>
        <SettingsIcon
          onClick={() => {
            navigate(`/user/${data._id}`);
          }}
          className="ml-3 cursor-pointer"
          style={{ fontSize: 15 }}
        />
      </div>
    </div>
  );
};

export default HeaderComponent;
