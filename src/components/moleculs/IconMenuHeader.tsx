import { useState, useEffect, useRef } from "react";
import { Avatar } from "@mui/material";
import { useKey } from "../../utils";
import GetDataServer, { DataAPI } from "../../utils/GetDataServer";
import { InfoDateComponent } from "../atoms";

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
      setData(result.data);
    } catch (error: any) {
      console.log(error);
    }
  };

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
      <div className="w-[5px] h-[5px]  rounded-full bg-red-400 absolute top-1 right-0 border border-red-500 "></div>
      <ul
        className={  ` max-h-[450px] ${
          !active && `hidden`
        } border w-80 absolute right-0 top-6 h-auto overflow-y-auto scrollbar-none  bg-white drop-shadow-sm overflow-hidden p-2 duration-500 rounded-md rounded-tr-none`}
      >
        {data.map((item: any, index: any) => {
          console.log(item)
          return (
            <li
              key={index}
              ref={componentRef}
              className="w-full  h-auto rounded-md flex items-center px-2 py-2 cursor-pointer bg-blue-50 hover:bg-gray-100 mb-2"
              onClick={() => {
                alert("dd");
                setActive(false);
              }}
            >
              <Avatar
                alt={item.user.name}
                src="https://newprofilepic2.photo-cdn.net//assets/images/article/profile.jpg"
                sx={{ width: 50, height: 50 }}
              />
              <ul className="flex-1 ml-2 h-[90%] flex flex-col ">
                <li className="text-[0.9em] mt-[1px]">
                  <b className="font-bold">{item.user.name}</b> {item.message}
                </li>
                <li className="text-[0.7em] -mt-1 text-gray-500">
                <InfoDateComponent date={item.createdAt} className="-ml-14" />
                </li>
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default IconMenuHeader;
