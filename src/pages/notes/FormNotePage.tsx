import React from "react";

const FormNotePage: React.FC<any> = ({ props }) => {
  return (
    <div className="">
      <label>{props.id}</label>
      <input className="border my-2 w-full rounded-md h-10" />
      <label>Result</label>
      <textarea className="border my-2 w-full rounded-md h-40" />
      <label>Result</label>
      <textarea className="border my-2 w-full rounded-md h-40" />
    </div>
  );
};

export default FormNotePage;
