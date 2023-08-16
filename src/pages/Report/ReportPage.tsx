import DescriptionIcon from "@mui/icons-material/Description";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold m-3">Report List</div>
      <ul className="w-full h-automx-3 float-left">
        <li
          onClick={() => navigate("/report/notes")}
          className="list-none ml-3 items-center flex border rounded-md bg-white float-left w-1/3 shadow-md px-3 py-5 cursor-pointer hover:px-5 duration-100 hover:py-6"
        >
          <DescriptionIcon style={{fontSize:16}} />
          <h4 className="text-gray-800 font-semibold ml-1">Notes</h4>
        </li>
        <li
          onClick={() => navigate("/report/schedule")}
          className="list-none ml-3 items-center flex border rounded-md bg-white float-left w-1/3 shadow-md px-3 py-5 cursor-pointer hover:px-5 duration-100 hover:py-6"
        >
          <EventAvailableIcon style={{fontSize:16}} />
          <h4 className="text-gray-800 font-semibold ml-1">Schedule</h4>
        </li>
      </ul>
    </div>
  );
}

export default ReportPage;
