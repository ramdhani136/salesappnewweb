import moment from "moment";
import React, { useState } from "react";
interface IDateProps {
  date: String;
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
}

const InfoDateComponent: React.FC<IDateProps> = ({ date, className }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div
      className={`inline text-gray-600 text-[0.93em]   `}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <h5 className="mr-2 inline">-</h5>
      <h5 className="inline ">{moment(`${date}`).fromNow()}</h5>
      <h6
        className={`${
          !open && "hidden"
        } duration-300 absolute -ml-3 -mt-12 text-white border text-center w-[160px] rounded-md py-1 px-2 bg-gray-900 ${className} `}
      >
        {moment(`${date}`).format("lll")}
      </h6>
    </div>
  );
};

export default React.memo(InfoDateComponent);
