import { useCallback } from "react";
import { Handle, Position } from "reactflow";

const handleStyle = { left: 10 };

const TextUpdaterNode = (isConnectable: any) => {
  const onChange = useCallback((evt: any) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="h-[100px] w-auto flex bg-white border border-gray-600 p-2 rounded-md ">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="w-full flex flex-col">
        <h4 className="text-[0.8em] mb-1">Welcome Message:</h4>
        <textarea
          name=""
          id=""
          rows={4}
          className=" text-gray-700 rounded-md border text-[0.8em] p-2 border-gray-500"
          value={`Halo ada yang bisa kami bantu?`}
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

export default TextUpdaterNode;
