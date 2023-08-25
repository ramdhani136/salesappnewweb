import React from "react";

interface IProps {
  percentage: number;
}

const ProgressBarComponent: React.FC<IProps> = ({ percentage = 0 }) => {
  return (
    <div className="relative  -z-[1] hover:z-10">
      <div className="overflow-hidden h-[1.1rem] mb-4 text-xs flex rounded bg-gray-200">
        <div
          style={{ width: `${percentage}%` }}
          className="shadow-none flex flex-col text-center duration-300 whitespace-nowrap text-white justify-center bg-green-500"
        ></div>
        <span className="text-xs font-semibold inline-block text-white absolute   w-full mt-[1px] text-center">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default ProgressBarComponent;
