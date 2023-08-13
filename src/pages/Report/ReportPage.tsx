import React from "react";
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold m-3">Report List</div>
      <ul className="w-full h-automx-3 float-left">
        <li onClick={()=>navigate("/report/notes")} className="list-none ml-3 border rounded-md bg-white float-left w-1/3 shadow-md px-3 py-5 cursor-pointer hover:px-5 duration-100 hover:py-6">
          <h4 className="text-gray-800">Notes</h4>
        </li>
      </ul>
    </div>
  );
}

export default ReportPage;
