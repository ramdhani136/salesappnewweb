import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { ReactElement, useState } from "react";

interface IProps {
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
  child?: ReactElement<any, any>;
  name:String
}

const ToggleBodyComponent: React.FC<IProps> = ({ className, child ,name}) => {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <div className={`${className} border bg-white rounded-md py-5 px-6`}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h4 className="font-semibold">{name}</h4>
        {open ? (
          <ExpandLessIcon style={{ fontSize: 20 }} className={`ml-2 mt-1`} />
        ) : (
          <ExpandMoreIcon style={{ fontSize: 20 }} className={`ml-2 mt-1`} />
        )}
      </div>
      {open && <div className={`w-full mt-4 mb-3  duration-700`}>{child}</div>}
    </div>
  );
};

export default React.memo(ToggleBodyComponent);
