import React, { useState, useEffect, useRef } from "react";
import InsertEmoticonRoundedIcon from "@mui/icons-material/InsertEmoticonRounded";
import gambar from "../../assets/images/nomessage.svg";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import ChatBubleComponent from "./ChatBubleComponent";
import { LoadingComponent } from "../moleculs";
import { LocalStorage, SocketIO } from "../../utils";
import ScaleLoader from "react-spinners/ScaleLoader";
import PulseLoader from "react-spinners/PulseLoader";
import InfiniteScroll from "react-infinite-scroll-component";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
interface IProps {
  userConversation: any;
}

interface IPropsChatButton {
  onCLick?(e?: any): void | Promise<void>;
}

const ChatIconButton: React.FC<IPropsChatButton> = ({ onCLick }) => {
  const [hover, setHover] = useState<Boolean>(false);

  return (
    <div>
      {hover && (
        <h4 className="absolute border bg-gray-700 text-white text-[0.75em]  text-center rounded-lg p-[4px] px-2 -mt-6 shadow-md">
          File Attachment
        </h4>
      )}
      <AddPhotoAlternateIcon
        onClick={() => {
          onCLick && onCLick();
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="text-[#2491f0] cursor-pointer"
        style={{ fontSize: 20 }}
      />
    </div>
  );
};

const CharIconButtonComponent = React.memo(ChatIconButton);

const ChatMessageComponent: React.FC<IProps> = ({ userConversation }) => {
  const [isData, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<Boolean>(true);
  const [newMessage, setNewMessage] = useState<String>("");
  const [moreLoading, setMoreLoading] = useState<Boolean>(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [openEmoji, setOpenEmoji] = useState<Boolean>(false);
  const modalRef = useRef<any>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState<number>(10);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<String>("");
  const [lastScroll, setLastScroll] = useState<number>(0);

  const getMesssage = async (): Promise<void> => {
    try {
      const result: any = await GetDataServer(DataAPI.MESSAGE).FIND({
        params: `/${userConversation.chatId}`,
        limit: limit,
        page: page,
        search: search,
      });
      setData([...result.data, ...isData]);
      setHasMore(result.hasMore);
      setPage(result.nextPage);
      setLoading(false);
      SocketIO.emit("join chat", userConversation.chatId);
      setMoreLoading(false);
      scrollRef.current?.scrollTo({
        top: lastScroll,
        // behavior: "smooth",
      });
    } catch (error: any) {
      setLoading(false);

      setMoreLoading(false);
    }
  };

  const sendMessage = async (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (openEmoji) {
        setOpenEmoji(false);
      }
      if (newMessage) {
        SocketIO.emit("stop typing", userConversation.chatId);
        try {
          setNewMessage("");
          const result = await GetDataServer(DataAPI.MESSAGE).CREATE({
            content: newMessage,
            chatId: userConversation.chatId,
          });
          SocketIO.emit("new message", result.data.data);
          setData([...isData, result.data.data]);
          scrollRef.current?.scrollTo({
            top: 0,
            // behavior: "smooth",
          });
        } catch (error) {}
      }
    }
  };

  const typingHandler = (e: any) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      SocketIO.emit("typing", userConversation.chatId);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      SocketIO.emit("stop typing", userConversation.chatId);
      setTyping(false);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [newMessage]);

  useEffect(() => {
    getMesssage();
    let handler = (e: any) => {
      if (!modalRef.current?.contains(e.target)) {
        setOpenEmoji(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  useEffect(() => {
    SocketIO.emit("setup", LocalStorage.getUser()._id);
    SocketIO.on("connected", () => setSocketConnected(true));

    SocketIO.on("typing", () => setTyping(true));
    SocketIO.on("stop typing", () => setTyping(false));
    SocketIO.on("message recieved", (newMessageRecieved) => {
      setData([...isData, newMessageRecieved]);
    });
  });

  return (
    <div className="flex flex-col  flex-1 w-full h-full relative">
      {moreLoading && (
        <div className="absolute w-full text-center bg-white z-20 opacity-95 text-[0.8em]  py-1 flex items-center justify-center">
          <h4 className="text-gray-400">Loading</h4>
          <ScaleLoader className="ml-2" height={10} color="#36d7b7" width={3} />
        </div>
      )}
      {!loading ? (
        <>
          {isData.length > 0 ? (
            <div
              ref={scrollRef}
              id="scrollChat"
              className="flex flex-col-reverse border  flex-1 scrollbar-track-gray-50 scrollbar-thumb-gray-100 scrollbar-thin py-2 text-[0.8em]"
            >
              <InfiniteScroll
                dataLength={isData.length}
                next={() => {
                  setMoreLoading(true);
                  setLastScroll(scrollRef.current?.scrollTop ?? 0);
                  getMesssage();
                }}
                hasMore={hasMore}
                inverse={true}
                loader={<></>}
                scrollableTarget="scrollChat"
                style={{ overflowX: "hidden" }}
              >
                {isData.map((item, index) => (
                  <ChatBubleComponent
                    key={index}
                    data={{
                      ...item,
                      isSameUser:
                        isData.length > 1 && index > 0
                          ? isData[index - 1].sender._id === item.sender._id
                            ? true
                            : false
                          : false,
                    }}
                  />
                ))}
              </InfiniteScroll>
            </div>
          ) : (
            <div className=" flex flex-col justify-center items-center flex-1 border">
              <img src={gambar} alt="nomessage" className="w-[160px]" />
              <h4 className="text-[0.8em] text-gray-400  mt-4">No Message</h4>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1">
          <LoadingComponent />
        </div>
      )}
      {typing && (
        <div className="absolute w-full text-center bg-white z-20 opacity-95 text-[0.8em] py-1  flex items-center justify-center bottom-[58px]">
          <PulseLoader className="ml-2" color="#ccc" size={6} />
        </div>
      )}
      <div className="h-auto  flex items-center px-2 py-2">
        <CharIconButtonComponent />
        <form
          onKeyDown={sendMessage}
          className="h-auto border w-full bg-[#f1f2f6]  rounded-lg ml-2 flex py-2 items-center"
        >
          <input
            value={`${newMessage}`}
            onChange={typingHandler}
            className="w-full h-auto  block outline-none overflow-hidden resize-none bg-[#f1f2f6] rounded-lg px-2 text-gray-800 text-sm"
          />
          <div className="relative">
            <InsertEmoticonRoundedIcon
              onClick={() => {
                setOpenEmoji(!openEmoji);
              }}
              className="mr-1 cursor-pointer text-[#2491f0]"
            />
            {openEmoji && (
              <div
                ref={modalRef}
                className={`border  bg-white   rounded-md w-[300px] h-[332px] right-0 duration-500 absolute bottom-6 shadow-md overflow-hidden z-20  `}
              >
                <Picker
                  data={data}
                  onEmojiSelect={(e: any) =>
                    setNewMessage(newMessage + e.native)
                  }
                  emojiSize={18}
                  perLine={7}
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ChatMessageComponent);
