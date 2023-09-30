import { useEffect, useState } from "react";
import ReactFlow, { Background, MiniMap, Controls } from "reactflow";

import "reactflow/dist/style.css";
import dagre from "dagre";
import TextUpdaterNode from "./chartcomponents/TextUpdaterNode";
import ChartFormInput from "./chartcomponents/ChartFormInput";

const WhatsappFlowChart = () => {
  const nodeTypes = { textUpdater: TextUpdaterNode, inputUser: ChartFormInput };

  const initialNodes: any = [
    {
      id: "start",
      position: { x: 0, y: 0 },
      data: { label: "Start Point" },
      style: {
        backgroundColor: "#0274f6",
        color: "white",
        width: 80,
        height: 26,
        padding: "4px 8px 4px 8px",
        borderRadius: 20,
        fontWeight: 600,
      },
    },
    {
      id: "welcome",
      position: { x: 0, y: 0 },
      data: { label: "Welcome Message" },
      style: { fontWeight: 600, width: 180, height: 80 },
      type: "textUpdater",
    },
    {
      id: "userinput",
      position: { x: 0, y: 0 },
      data: { label: "Add User Input" },
      style: {
        backgroundColor: "#0274f6",
        color: "white",
        width: 100,
        height: 26,
        padding: "4px 7px 4px 7px",
        borderRadius: 5,
        fontWeight: 600,
      },
    },
    {
      id: "fallback",
      position: { x: 0, y: 0 },
      data: { label: "Default Fallback" },
      style: {
        backgroundColor: "#eff0f4",
        color: "black",
        width: 120,
        height: 28,
        padding: "5px 8px 5px 8px",
        borderRadius: 5,
        fontWeight: 600,
      },
    },
    {
      id: "branch",
      position: { x: 0, y: 0 },
      data: { label: "User Input" },
      style: { fontWeight: 600, width: 180, height: 80 },
      type: "inputUser",
    },
    {
      id: "product",
      position: { x: 0, y: 0 },
      data: { label: "User Input" },
      style: { fontWeight: 600, width: 180, height: 80 },
      type: "inputUser",
    },
  ];
  const initialEdges = [
    {
      id: "1",
      source: "start",
      target: "welcome",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "2",
      source: "welcome",
      target: "userinput",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "3",
      source: "userinput",
      target: "fallback",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "4",
      source: "userinput",
      target: "branch",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
    {
      id: "5",
      source: "userinput",
      target: "product",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
    },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // const applyDagreLayout = () => {
  //   const graph = new dagre.graphlib.Graph();
  //   graph.setGraph({ rankdir: "TB", ranksep: 50, nodesep: 50, edgesep: 10 });
  //   graph.setDefaultEdgeLabel(() => ({}));

  //   nodes.forEach((node: any) => {
  //     const nodeWidth = 150;
  //     const nodeHeight = node.style.height || 40;
  //     graph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  //   });

  //   edges.forEach((edge) => {
  //     graph.setEdge(edge.source, edge.target, { label: edge.type });
  //   });

  //   try {
  //     dagre.layout(graph);
  //   } catch (error) {
  //     console.error("Error during dagre layout:", error);
  //     return;
  //   }

  //   const layoutedElements = nodes.map((node: any) => {
  //     return {
  //       ...node,
  //       position: {
  //         x: graph.node(node.id).x - node.style.width / 2,
  //         y: graph.node(node.id).y,
  //       },
  //     };
  //   });

  //   console.log(layoutedElements);
  //   setNodes(layoutedElements);
  // };

  const applyDagreLayout = () => {
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ rankdir: "TB", ranksep: 50, nodesep: 200, edgesep: 10 });
    graph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node: any) => {
      const nodeWidth = 150;
      const nodeHeight = node.style.height || 40;
      graph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      // Menentukan weight berdasarkan tinggi node target
      const targetNode = nodes.find((node: any) => node.id === edge.target);
      const targetNodeHeight = targetNode ? targetNode.style.height || 40 : 40;
      const weight = targetNodeHeight / 40; // Sesuaikan sesuai kebutuhan

      graph.setEdge(edge.source, edge.target, { label: edge.type, weight });
    });

    try {
      dagre.layout(graph);
    } catch (error) {
      console.error("Error during dagre layout:", error);
      return;
    }

    const layoutedElements = nodes.map((node: any) => {
      let offsetY = 0;

      // Tambahkan margin untuk start node
      if (node.id === "start") {
        offsetY = 20; // Sesuaikan angka sesuai kebutuhan
      }

      return {
        ...node,
        position: {
          x: graph.node(node.id).x - node.style.width / 2,
          y: graph.node(node.id).y - node.style.height / 2 + offsetY,
        },
      };
    });

    setNodes(layoutedElements);
  };

  useEffect(() => {
    applyDagreLayout();
  }, []);

  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default WhatsappFlowChart;
