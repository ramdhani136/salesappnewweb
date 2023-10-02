import { useCallback, useState } from "react";
import { Handle, Position } from "reactflow";
import RepeatOutlinedIcon from "@mui/icons-material/RepeatOutlined";
const handleStyle = { left: 10 };

const ChartResponseInput = (isConnectable: any) => {
  const [value, setValue] = useState<string>("");
  const onChange = useCallback((evt: any) => {
    setValue(evt.target.value);
  }, []);

  return (
    <div className="h-auto w-auto flex bg-white border border-gray-600 p-2 rounded-md ">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="w-full flex flex-col">
        <div className="flex justify-between items-center">
          <h4 className="text-[0.8em] mb-1">Bot Response Type</h4>
          <RepeatOutlinedIcon
            style={{ marginTop: "-5px", fontSize: 17 }}
            className="opacity-60 hover:opacity-90 duration-300"
          />
        </div>
        <textarea
          name=""
          id=""
          rows={4}
          onChange={(e) => onChange(e)}
          className=" rounded-md border font-normal text-[0.8em] p-2 border-gray-500"
          value={value}
          placeholder=""
        ></textarea>
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

export default ChartResponseInput;
