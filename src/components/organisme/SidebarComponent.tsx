import React, { useEffect, useState } from "react";
import SegmentIcon from "@mui/icons-material/Segment";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { Link, useNavigate } from "react-router-dom";
import MarkUnreadChatAltOutlinedIcon from '@mui/icons-material/MarkUnreadChatAltOutlined';
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import {
  AlertModal,
  LocalStorage,
  LocalStorageType,
  useKey,
} from "../../utils";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SettingsIcon from "@mui/icons-material/Settings";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

interface IProps {
  user: any;
  getStatusOpen?: Function;
}

const SidebarComponent: React.FC<IProps> = ({ user, getStatusOpen }) => {
  const menus = [
    { name: "Dashboard", link: "/", icon: HomeIcon },
    { name: "Schedules", link: "/schedule", icon: EventNoteIcon },
    { name: "Memo", link: "/memo", icon: AssignmentTurnedInIcon },
    { name: "Callsheet", link: "/callsheet", icon: SupportAgentIcon },
    { name: "Visit", link: "/visit", icon: DirectionsRunIcon },
    { name: "Users", link: "/users", icon: PeopleAltOutlinedIcon },
    { name: "Whatsapp", link: "/whatsapp", icon: MarkUnreadChatAltOutlinedIcon },
    { name: "Reports", link: "/report", icon: AssessmentOutlinedIcon },
    { name: "Settings", link: "/setting", icon: SettingsIcon },
  ];

  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useKey(
    "b",
    () => {
      setOpen(!open);
    },
    {
      ctrl: true,
    }
  );

  const onLogout = () => {
    AlertModal.confirmation({
      text: "You want to log out of your account?",
      onConfirm: () => {
        LocalStorage.removeData(LocalStorageType.TOKEN);
        navigate("/login");
      },
      confirmButtonText: "Yes, Logout!",
    });
  };

  useEffect(() => {
    if (getStatusOpen) {
      getStatusOpen(open);
    }
  }, [open]);

  return (
    <section className="flex">
      <div
        className={` bg-[#1b1c1e] max-h-screen h-screen ${
          open ? "w-72 md:w-[13rem]" : "w-16"
        } text-gray-100 duration-500 px-3 flex flex-col justify-around z-[70]`}
      >
        <div
          className="py-3 flex  justify-between items-center"
          onClick={() => setOpen(!open)}
        >
          <h1 className={`${!open && "hidden duration-500"} ml-1 text-xl`}>
            CRM Sytem
          </h1>

          {!open ? (
            <SegmentIcon
              className="cursor-pointer ml-[5px]"
              style={{ fontSize: 21 }}
            />
          ) : (
            <CloseOutlinedIcon
              className="cursor-pointer ml-[5px]"
              style={{ fontSize: 21 }}
            />
          )}
        </div>
        <div className="mt-2 flex flex-col  gap-2 relative">
          {open && (
            <h4 className="text-[#515254] text-[0.75em] font-bold ml-2">
              MENU
            </h4>
          )}
          {menus.map((menu, id) => (
            <Link
              to={menu.link}
              key={id}
              className="group flex items-center text-sm gap-3 p-2 hover:bg-[#323335] text-[#b2b3b6]  rounded-md"
            >
              <menu.icon style={{ fontSize: 18 }} />
              <h2
                style={{
                  transitionDelay: `${id + 3}00ms`,
                }}
                className={`text-md whitespace-pre duration-500 ${
                  !open && "opacity-0 translate-x-28 overflow-hidden"
                }`}
              >
                {menu.name}
              </h2>
              <h2
                className={`${
                  open && `hidden`
                } absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit`}
              >
                {menu.name}
              </h2>
            </Link>
          ))}
        </div>
        <div className={` w-full flex-1 flex  justify-end flex-col mb-6`}>
          <a
            onClick={onLogout}
            className="flex group items-center bg-[#323335] rounded-md p-2 ml-[2.5%] px-4 w-[95%] mt-3 opacity-80 hover:opacity-100 cursor-pointer"
          >
            <LogoutIcon
              style={{ fontSize: 18 }}
              className={`${!open && "-ml-1"}`}
            />
            {open && (
              <h6 className="ml-5 text-[0.85em] font-semibold">Log Out</h6>
            )}
            <div
              className={`${
                open && `hidden`
              } absolute left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:mt-1 group-hover:px-2 group-hover:py-1 group-hover:left-[70px] group-hover:duration-300 group-hover:w-fit`}
            >
              Log Out
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SidebarComponent;
