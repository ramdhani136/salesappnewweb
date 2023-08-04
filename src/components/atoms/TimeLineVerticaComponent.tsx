import moment from "moment";
import { useState } from "react";

interface IProps {
  data: any[];
}

interface ITime {
  date: string;
}

const TimeLineVertical: React.FC<IProps> = ({ data }) => {
  // Time Component
  const TimeComponent: React.FC<ITime> = ({ date }) => {
    const [open, setOpen] = useState<boolean>(false);
    return (
      <div
        className="inline relative cursor-pointer"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <h6 className="inline">{moment(date).fromNow()}</h6>

        {open && (
          <h6 className="absolute left-0 -top-5 w-[150px] text-center text-[0.95em] p-1 py-[1px] bg-slate-900 text-white rounded-md">
           {moment(`${date}`).format("lll")}
          </h6>
        )}
      </div>
    );
  };
  // End

  return (
    <ul className="mt-10 mb-8 text-sm ml-12">
      {data.length > 0 &&
        data.map((item, key) => (
          <li
            key={key}
            className={` pl-5 pb-6  ${
              key + 1 !== data.length && "border-l"
            } border-[#d4d4d4] relative float-left w-[70%] text-start`}
          >
            <div className="-mt-[7px] w-[15px] h-[15px] border border-gray-300 absolute rounded-full bg-white -left-[7px]">
              <div className="w-[6px] h-[6px] border absolute rounded-full bg-gray-600 top-[4px] left-[3.8px]"></div>
            </div>
            <div className="-mt-[10px] ml-3">
              <b className="font-medium">{item.user.name}</b> {item.message} -{" "}
              <TimeComponent date={item.createdAt} />
            </div>
          </li>
        ))}
    </ul>
  );
};

export default TimeLineVertical;
