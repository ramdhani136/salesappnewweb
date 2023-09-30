import { useEffect, useState } from "react";
import ReactFlow, { Background, MiniMap, Controls } from "reactflow";

import "reactflow/dist/style.css";
import dagre from "dagre";

const WhatsappFlowChart = () => {
  const initialNodes: any = [
    {
      id: "start",
      position: { x: 0, y: 0 },
      data: { label: "Start Point" },
      style: {
        backgroundColor: "#2196f3",
        color: "white",
        width: "auto",
        height: "auto",
        padding: "4px 8px 4px 8px",
        borderRadius: 20,
      },
    },
    {
      id: "welcome",
      position: { x: 0, y: 0 },
      data: { label: "Welcome Message" },
    },
    {
      id: "userinput",
      position: { x: 0, y: 0 },
      data: { label: "Add User Input" },
      style: {
        backgroundColor: "#2196f3",
        color: "white",
        width: "auto",
        height: "auto",
        padding: "4px 7px 4px 7px",
        borderRadius: 5,
      },
    },
    {
      id: "fallback",
      position: { x: 0, y: 0 },
      data: { label: "Default Fallback" },
      style: {
        backgroundColor: "#eff0f4",
        color: "black",
        width: "auto",
        height: "auto",
        padding: "5px 8px 5px 8px",
        borderRadius: 5,
      },
    },
    {
      id: "1",
      position: { x: 0, y: 0 },
      data: { label: "Product" },
      style: {
        backgroundColor: "#eff0f4",
        color: "black",
        width: "auto",
        height: "auto",
        padding: "5px 8px 5px 8px",
        borderRadius: 5,
      },
    },
    {
      id: "2",
      position: { x: 0, y: 0 },
      data: { label: "Branch" },
      style: {
        backgroundColor: "#eff0f4",
        color: "black",
        width: "auto",
        height: "auto",
        padding: "5px 8px 5px 8px",
        borderRadius: 5,
      },
    },
    {
      id: "3",
      position: { x: 0, y: 0 },
      data: { label: "Sales" },
      style: {
        backgroundColor: "#eff0f4",
        color: "black",
        width: "auto",
        height: "auto",
        padding: "5px 8px 5px 8px",
        borderRadius: 5,
      },
    },
    {
      id: "4",
      position: { x: 0, y: 0 },
      data: { label: "Info" },
      style: {
        backgroundColor: "#eff0f4",
        color: "black",
        width: "auto",
        height: "auto",
        padding: "5px 8px 5px 8px",
        borderRadius: 5,
      },
    },
  ];
  const initialEdges = [
    {
      id: "1",
      source: "start",
      target: "welcome",
      type: "step",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "2",
      source: "welcome",
      target: "userinput",
      type: "step",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "3",
      source: "userinput",
      target: "fallback",
      type: "step",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "4",
      source: "userinput",
      target: "1",
      type: "step",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "5",
      source: "userinput",
      target: "2",
      type: "step",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "6",
      source: "userinput",
      target: "3",
      type: "step",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "7",
      source: "userinput",
      target: "4",
      type: "step",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const applyDagreLayout = () => {
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ rankdir: "TB", nodesep: 50, edgesep: 10, ranksep: 50 });
    graph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node: any) => {
      const nodeWidth = 150;
      const nodeHeight = 40;
      graph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      graph.setEdge(edge.source, edge.target, { label: edge.type }); // Adjusted for edge type
    });

    try {
      dagre.layout(graph);
    } catch (error) {
      console.error("Error during dagre layout:", error);
      return;
    }

    const layoutedElements = nodes.map((node: any) => ({
      ...node,
      position: {
        x: graph.node(node.id).x,
        y: graph.node(node.id).y,
      },
    }));

    console.log(layoutedElements);

    setNodes(layoutedElements);
  };

  useEffect(() => {
    applyDagreLayout();
  }, []);

  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <ReactFlow
        nodes={nodes}
        // onNodesChange={onNodesChange}
        edges={edges}
        // onEdgesChange={onEdgesChange}
      >
        {/* <MiniMap /> */}
        <Controls />
        <Background color="#eaeaea" />
      </ReactFlow>
    </div>
  );
};

export default WhatsappFlowChart;
