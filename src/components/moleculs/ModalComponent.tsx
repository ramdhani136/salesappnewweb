import React from "react";

interface IProps {
  isVisible?: boolean;
  onClose?: (e?: any) => Promise<any> | void;
  child?: React.FC<any> | null;
  props?: {};
  className?: React.HTMLAttributes<HTMLDivElement> | string | undefined;
}

const ModalComponent: React.FC<IProps> = ({
  isVisible,
  onClose,
  child,
  props,
  className,
}) => {
  if (!isVisible) return null;

  const handleClose = (e: any): void => {
    if (onClose) {
      if (e.target.id === "wrapper") onClose();
    }
  };

  const Child = child ? React.memo(child) : null;

  return (
    <div
      className="w-[100%] h-[100vh] inset-0 fixed  z-[100] flex justify-center items-center  bg-black bg-opacity-70  "
      id="wrapper"
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-md   border border-gray-500 ${
          className ?? ""
        }  max-h-[98%] flex flex-col`}
      >
        {/* <h4 className="p-4">Form Notes </h4> */}
        <div className=" rounded-md  scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-300  ">
    
          {Child && <Child props={props} />}
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;
