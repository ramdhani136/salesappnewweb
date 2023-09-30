import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
const handleStyle = { left: 10 };

const ChartFormInput = (isConnectable: any) => {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="h-auto w-auto flex bg-white border border-gray-600 p-2 rounded-md ">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="w-full flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RecordVoiceOverOutlinedIcon
              className="mr-1 mt-1 mb-2"
              style={{ fontSize: "13px", color: "gray" }}
            />
            <h4 className="text-[0.8em] mb-1">User Input</h4>
          </div>
          <MoreVertIcon style={{ fontSize: "20px" }} />
        </div>
        <div className="flex items-center">
          <input type="checkbox" id="myCheckbox" className="mr-1"></input>
          <h5 className="text-[0.8em] font-normal">Variable Input</h5>
        </div>
        <input type="text" className="py-1 px-2 border border-gray-400 rounded-md mt-2"/>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={handleStyle}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default ChartFormInput;
