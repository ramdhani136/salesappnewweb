import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
// import ShortcutOutlinedIcon from "@mui/icons-material/ShortcutOutlined";
import { useState, useRef } from "react";
import _ from "lodash";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useKey } from "../../utils";

const SeacrhHeaderComponent: React.FC = () => {
  const [active, setActive] = useState<boolean>(false);
  const [onSearch, setOnsearch] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<any>("");

  useKey(
    "g",
    () => {
      !active ? inputRef.current?.focus() : inputRef.current?.blur();
      setActive(!active);
    },
    {
      ctrl: true,
    }
  );

  useKey("Escape", () => {
    inputRef.current?.blur();
    setActive(false);
    setValue("");
  });

  const menus = [
    { name: "Form Schedule", link: "/schedule/new" },
    { name: "Schedule List", link: "/schedule" },
    { name: "Workflow List", link: "/workflow" },
    { name: "Form Workflow", link: "/workflow/new" },
  ];

  const click = (): void => {
    setActive(!active);
    active ? inputRef.current?.blur() : inputRef.current?.focus();
  };

  const filterMenu = (data: any[]) => {
    return _.filter(data, function (query: any) {
      var name = value
        ? query.name.toLowerCase().includes(value.toLowerCase())
        : true;
      return name;
    });
  };

  const sort = (data: any[]): any[] => {
    return data.sort((a: any, b: any) => {
      return a["name"] > b["name"] ? 1 : -1;
    });
  };

  return (
    <div className=" md:w-[23rem] lg:w-[18rem] relative">
      <div
        className="border w-full  h-10 rounded-md bg-gray-100 border-gray-200 flex items-center"
        onClick={click}
      >
        <SearchOutlinedIcon
          style={{ fontSize: 20 }}
          className="text-gray-400 ml-2 mt-1"
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            if (active && !onSearch) {
              setActive(false);
              inputRef.current?.blur();
            }
          }}
          ref={inputRef}
          placeholder="Search a menu"
          className="bg-gray-100 text-[0.95m]  font-normal px-1 flex-1 mr-2 outline-none"
        />
        {value && (
          <CloseOutlinedIcon
            onClick={() => setValue("")}
            style={{ fontSize: 18 }}
            className={`text-gray-300 cursor-pointer`}
          />
        )}
        <div className="w-[60px] h-[28px] border bg-white rounded-md ml-1 mr-1 flex items-center justify-center text-gray-700">
          {/* <ShortcutOutlinedIcon style={{ fontSize: 13 }} /> */}
          <h6 className="text-[0.8em] ml-1 font-medium">Ctrl + G</h6>
        </div>
      </div>
      <ul
        onClick={() => {
          setActive(false);
          inputRef.current?.blur();
        }}
        onMouseLeave={() => setOnsearch(false)}
        onMouseEnter={() => setOnsearch(true)}
        className={`${
          !active && "hidden"
        } p-2 px-1 duration-500 w-full border  max-h-80 overflow-y-auto absolute scrollbar-none  top-9 bg-white rounded-b-md drop-shadow-sm text-[0.95em] text-gray-600`}
      >
        {filterMenu(sort(menus)).map((menu, id) => (
          <li
            key={id}
            className="p-2 py-3 hover:bg-gray-100 rounded-md cursor-pointer"
            onClick={() => alert("halow")}
          >
            {menu.name}
          </li>
        ))}

        {filterMenu(menus).length < 1 && (
          <li className="p-2 py-5 rounded-md cursor-pointer text-center text-gray-400 font-normal">
            Search not found
          </li>
        )}
      </ul>
    </div>
  );
};

export default SeacrhHeaderComponent;
