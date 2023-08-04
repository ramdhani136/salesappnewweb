import { useState, useEffect, useRef } from "react";
import { Avatar } from "@mui/material";
import { useKey } from "../../utils";

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

  useEffect(() => {
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
        className={`${
          !active && `hidden`
        } border w-80 absolute right-0 top-6 h-auto overflow-y-auto scrollbar-none  bg-white drop-shadow-sm overflow-hidden p-2 duration-500 rounded-md rounded-tr-none`}
      >
        <li
          ref={componentRef}
          className="w-full  h-16 rounded-md flex items-center px-2 cursor-pointer bg-blue-50 hover:bg-gray-100 mb-2"
          onClick={() => {
            alert("dd");
            setActive(false);
          }}
        >
          <Avatar
            alt="Ilham Ramdhani"
            src="https://newprofilepic2.photo-cdn.net//assets/images/article/profile.jpg"
            sx={{ width: 50, height: 50 }}
          />
          <ul className="flex-1 ml-2 h-[90%] flex flex-col ">
            <li className="text-[0.9em] mt-[1px]">
              <b className="font-bold">Juan Elbert</b> menambahkan schedule
              nomor <b className="font-bold">SCH20230012030</b>
            </li>
            <li className="text-[0.7em] -mt-1 text-gray-500">30 Minutes ago</li>
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default IconMenuHeader;
