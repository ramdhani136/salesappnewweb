import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
const handleStyle = { left: 10 };

const ChartDefaultFallback = (isConnectable: any) => {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="h-auto w-auto flex  border -mt-2 bg-[#eff0f4] border-gray-600 p-2 rounded-md ">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="w-full flex  items-center justify-between">
        <h4 className="text-[0.8em] mb-1">Default Fallback</h4>
        <DriveFileRenameOutlineOutlinedIcon
          style={{ fontSize: 17 }}
          className="opacity-60 hover:opacity-90 duration-300"
        />
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

export default ChartDefaultFallback;
