import React, { useCallback } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
} from "reactflow";

import "reactflow/dist/style.css";
const WhatsappFlowChart = () => {
  const initialNodes = [
    { id: "welcome", position: { x: 120, y: 20 }, data: { label: "Start" } },
    { id: "Product", position: { x: 20, y: 100 }, data: { label: "Product" } },
    { id: "Branch", position: { x: 220, y: 100 }, data: { label: "Branch" } },
    { id: "Bogor", position: { x: 220, y: 200 }, data: { label: "Bogor" } },
    { id: "Depok", position: { x: 400, y: 200 }, data: { label: "Depok" } },
  ];
  const initialEdges = [
    { id: "e1-2", source: "welcome", target: "Product", animated: false },
    { id: "e1-3", source: "welcome", target: "Branch", animated: false },
    { id: "e1-4", source: "Branch", target: "Bogor", animated: false },
    { id: "e1-5", source: "Branch", target: "Depok", animated: false },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onClickCapture={(e) => console.log(e)}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        elementsSelectable={false} // Prevent nodes from being selected
        style={{ background: "#f0f0f0" }} // Set background color
        nodeTypes={{
          custom: () => null, // Disable default nodes
        }}
        edgeTypes={{
          straight: () => null, // Use straight edges
        }}
      >
        <Background />
        {/* <Controls /> */}
      </ReactFlow>
    </div>
  );
};

export default WhatsappFlowChart;
