import { Avatar } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CircleIcon from "@mui/icons-material/Circle";
// import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";

import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import ChatsConversions from "./ChatsConversions";
import { LoadingComponent } from "../moleculs";
import ChatMessageComponent from "./ChatMessageComponent";
import { SocketIO } from "../../utils";

const ChatsComponent: React.FC = () => {
  const [open, setOpen] = useState<Boolean>(false);
  const modalRef = useRef<any>();
  const [loading, setLoading] = useState<Boolean>(false);
  const [conversation, setConversation] = useState<any>({});
  const [userActive, setUserActive] = useState<any[]>([]);

  const IsActiveUser = (userId: String): Boolean => {
    const result = userActive.filter((item) => {
      return item.user._id === userId;
    });
    if (result.length > 0) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    let handler = (e: any) => {
      if (!modalRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    SocketIO.on("activeUsers", (data) => setUserActive(data));
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <div
      ref={modalRef}
      className={`border  h-[420px] absolute bg-white z-[300]   duration-300 rounded-t-lg shadow-md flex flex-col ${
        open
          ? "bottom-0 w-[320px] right-[20px]"
          : "-bottom-[383px] w-[230px] right-[5px]"
      }`}
    >
      <div
        className={`${
          open ? "h-10" : "h-9"
        } border-b  shadow-sm flex justify-evenly  items-center duration-500`}
      >
        <div className="flex flex-1 items-center">
          {open && conversation.chatId && (
            <div className="ml-2 relative">
              <ArrowBackIosIcon
                onClick={() => setConversation({})}
                className=" text-gray-600 opacity-60 hover:opacity-100 duration-500 cursor-pointer"
                style={{ fontSize: 15 }}
              />
            </div>
          )}
          {conversation.chatId && (
            <div className={`relative ${!open && "ml-2"}`}>
              <Avatar
                alt={`${conversation.user.name}`}
                src="d"
                sx={{ width: open ? 30 : 25, height: open ? 30 : 25 }}
                className={` cursor-pointer`}
              />
              {IsActiveUser(conversation.user._id) && (
                <CircleIcon
                  className={`absolute bottom-0 right-4 text-green-600 border border-white rounded-full bg-white`}
                  style={{ fontSize: open ? 10 : 8 }}
                />
              )}
            </div>
          )}

          <div className="flex flex-col ml-2">
            {!conversation.chatId ? (
              <div className="flex items-center">
                <QuestionAnswerOutlinedIcon
                  style={{ fontSize: 13 }}
                  className="mr-1 mt-[2px] "
                />
                <b className="text-[0.75em] font-medium">Chat Messager</b>
              </div>
            ) : (
              <>
                <b className="text-[0.75em] font-medium">
                  {conversation.user.name}
                </b>
                <h4
                  className={`${
                    open ? "text-[0.68em]" : "text-[0px]"
                  } text-gray-500 -mt-[3px] font-normal duration-500`}
                >
                  {IsActiveUser(conversation.user._id) ? `Online` : "Offline"}
                </h4>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center  mr-1 justify-center text-gray-500 ">
          <MinimizeIcon
            onClick={() => setOpen(!open)}
            className="-mt-4 cursor-pointer opacity-60 hover:opacity-100 duration-300"
          />
        </div>
      </div>
      <div className="flex-1 bg-white overflow-y-auto scrollbar-track-gray-50 scrollbar-thumb-gray-100 scrollbar-thin">
        {loading ? (
          <LoadingComponent />
        ) : conversation.chatId ? (
          <ChatMessageComponent userConversation={conversation} />
        ) : (
          <ChatsConversions
            IsActiveUser={IsActiveUser}
            setLoading={setLoading}
            setUserConversation={setConversation}
          />
        )}
      </div>
      {/* {userConversation._id && (
        <div className="h-auto  flex items-center px-2 py-2">
          <CharIconButtonComponent />
          <div className="h-auto border w-full bg-[#f1f2f6]  rounded-lg ml-2 flex py-2 items-center">
            <textarea className="w-full h-auto max-h-[100px]  block outline-none overflow-hidden resize-none bg-[#f1f2f6] rounded-lg px-2 text-gray-800 text-sm" />
            <InsertEmoticonRoundedIcon className="mr-1 cursor-pointer text-[#2491f0]" />
          </div>
        </div>
      )} */}
    </div>
  );
};

export default React.memo(ChatsComponent);
