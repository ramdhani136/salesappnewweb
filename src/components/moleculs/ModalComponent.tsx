import React from "react";

interface IProps {
  isVisible?: boolean;
  onClose?: (e?: any) => Promise<any> | void;
  child?: React.FC<any>|null;
}

const ModalComponent: React.FC<IProps> = ({ isVisible, onClose, child }) => {
  if (!isVisible) return null;

  const handleClose = (e: any): void => {
    if (onClose) {
      if (e.target.id === "wrapper") onClose();
    }
  };

  const Child = child ? React.memo(child) : null;

  return (
    <div
      className="w-[100%] h-[100vh] inset-0 fixed  z-[100] flex justify-center items-center  bg-black bg-opacity-50  "
      id="wrapper"
      onClick={handleClose}
    >
      <div className="w-auto h-auto bg-white rounded-md  border border-gray-500">
        {Child && <Child />}
      </div>
    </div>
  );
};

export default ModalComponent;
