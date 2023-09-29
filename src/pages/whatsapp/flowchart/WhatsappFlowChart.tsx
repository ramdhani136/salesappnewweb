import React, { useCallback } from "react";
import ReactFlow, { useNodesState, useEdgesState, addEdge,Background,Panel } from "reactflow";

import "reactflow/dist/style.css";
const WhatsappFlowChart = () => {
  const initialNodes = [
    { id: "1", position: { x: 100, y: 20 }, data: { label: "Start" } },
    { id: "2", position: { x: 20, y: 100 }, data: { label: "Insert" } },
  ];
  const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params:any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
          <Background />
          
      </ReactFlow>
    </div>
  );
};

export default WhatsappFlowChart;
