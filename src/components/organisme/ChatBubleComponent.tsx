import { Avatar } from "@mui/material";
import React, { useState } from "react";
import { LocalStorage, LocalStorageType } from "../../utils";
import jwt_decode from "jwt-decode";
import moment from "moment";

interface IMessage {
  _id: String;
  sender: {
    _id: String;
    name: String;
  };
  content: String;
  chat: {
    _id: String;
    users: String[];
  };
  isSameUser: any;
  createdAt: String;
  updatedAt: String;
}

interface IProps {
  data: IMessage;
}

const ChatBubleComponent: React.FC<IProps> = ({ data }) => {
  const [open, setOpen] = useState<Boolean>(false);

  const getUser = (): any => {
    const token = LocalStorage.loadData(LocalStorageType.TOKEN);
    if (token) {
      const decoded: any = jwt_decode(token);
      return decoded;
    }

    return {};
  };

  return (
    <li
      className={`w-[70%] flex justify-center  mb-3 mx-2 ${
        data.isSameUser && `-mt-2`
      }  ${data.sender._id === getUser()._id ? "float-right" : " float-left"} `}
    >
      {data.sender._id !== getUser()._id && !data.isSameUser && (
        <Avatar
          alt={`${data.sender.name}`}
          src="0"
          sx={{ width: 25, height: 25 }}
          className={`cursor-pointer`}
        />
      )}

      <div
        className={`border rounded-md mx-2 flex-1 p-2 cursor-pointer relative  ${
          data.sender._id === getUser()._id
            ? "bg-[#0084ff] text-white"
            : " bg-[#e5e6eb]"
        }`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <h4>{data.content}</h4>
        <h4
          className={`${
            !open && "hidden"
          }  duration-100 absolute z-20 bg-gray-700 px-2 py-1 text-white rounded-md right-0 top-0 opacity-90 text-[0.85em]`}
        >
          {moment(`${data.createdAt}`).format("lll")}
        </h4>
      </div>
      {data.sender._id === getUser()._id && !data.isSameUser && (
        <Avatar
          alt={`${data.sender.name}`}
          src="0"
          sx={{ width: 25, height: 25 }}
          className={`cursor-pointer mr-2`}
        />
      )}
    </li>
  );
};

export default React.memo(ChatBubleComponent);
