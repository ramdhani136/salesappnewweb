import { useState, useEffect, useRef } from "react";
import { Avatar } from "@mui/material";
import { useKey } from "../../utils";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import { InfoDateComponent } from "../atoms";
import { useNavigate } from "react-router-dom";

interface IProps {
  Icon: any;
  title?: String;
  iconSize?: number;
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
}

const IconMenuHeader: React.FC<IProps> = ({
  Icon,
  title,
  iconSize,
  className,
}) => {
  const [active, setActive] = useState<boolean>(false);
  const componentRef = useRef<any>();
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();

  const getData = async (): Promise<any> => {
    try {
      const result: any = await GetDataServer(DataAPI.HISTORY).FIND({
        filters: [
          ["status", "=", "0"],
          ["document.type", "=", "visit"],
          ["document.type", "=", "callsheet"],
        ],
        limit: 5,
      });
      if (result.data) {
        setData(result.data);
      }
    } catch (error: any) {
      console.log(error);
      console.log(error);
    }
  };

  function capitalizeFirstLetter(text:any) {
    const words = text.split(' ');
  
    for (let i = 0; i < words.length; i++) {
      if (i === 0 || isNaN(words[i])) {
        words[i] = words[i][0].toLowerCase() + words[i].substring(1).toLowerCase();
      }
    }
  
    return words.join(' ');
  }

  useEffect(() => {
    getData();
    let handler = (e: any) => {
      if (!componentRef.current.contains(e.target)) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  if (title === "notif") {
    useKey("m", () => setActive(!active), {
      ctrl: true,
    });
  }

  useKey("Escape", () => setActive(false));

  return (
    <div className={`relative group z-[52] ${className}`}>
      <Icon
        onClick={() => setActive(!active)}
        style={{ fontSize: iconSize ? iconSize : 20 }}
        className=" text-gray-500 ml-2 cursor-pointer"
      />
      <div
        className={`w-[5px] h-[5px]  rounded-full absolute top-1 right-0 border ${
          data.length > 0 && " border-red-500   bg-red-400"
        } `}
      ></div>
      <ul
        ref={componentRef}
        className={` max-h-[420px] ${
          !active && `hidden`
        } border w-80 absolute right-0 top-6 h-auto overflow-y-auto scrollbar-none  bg-white drop-shadow-sm overflow-hidden p-2 duration-500 rounded-md rounded-tr-none`}
      >
        {data.map((item: any, index: any) => {
          return (
            <li
              key={index}
              className="w-full  h-auto rounded-md flex items-center px-2 py-1 cursor-pointer bg-blue-50 hover:bg-gray-100 mb-2"
              onClick={() => {
                navigate(`/${item.document.type}/${item.document._id}`);
                navigate(0)
              }}
            >
              <Avatar
                alt={item.user.name}
                src={`${import.meta.env.VITE_PUBLIC_URI}/images/users/${
                  item.user.img
                }`}
                sx={{ width: 47, height: 47 }}
              />
              <ul className="flex-1 ml-2 h-[90%] flex flex-col ">
                <li className="text-[0.95em] mt-[1px]">
                  <b className="font-bold">{item.user.name}</b> <h4 className="inline text-[1em]">{item.message}</h4>
                </li>
                <li className="text-[0.7em] -mt-1 text-gray-500">
                  <InfoDateComponent date={item.createdAt} className="-ml-14" />
                </li>
              </ul>
            </li>
          );
        })}
        {data.length === 0 && (
          <div className="w-full h-[100px] flex items-center justify-center text-gray-300 text-[0.9em]">
            No Data
          </div>
        )}
      </ul>
    </div>
  );
};

export default IconMenuHeader;
