import { useEffect, useRef, useState } from "react";
import ReactFlow, { Background, MiniMap, Controls } from "reactflow";

import "reactflow/dist/style.css";
import dagre from "dagre";
import ChartWelcomeInput from "./chartcomponents/ChartWelcomeInput";
import ChartUserInput from "./chartcomponents/ChartUserInput";
import ChartResponseInput from "./chartcomponents/ChartResponseInput";
import ChartDefaultFallback from "./chartcomponents/ChartDefaultFallback";
import CircleIcon from "@mui/icons-material/Circle";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import { Meta } from "../../../utils";
import { LoadingComponent } from "../../../components/moleculs";

const WhatsappFlowChart = () => {
  const metaData = {
    title: `WhatsApp Bot- Sales App Ekatunggal`,
    description: "Halaman `WhatsApp Bot - Sales web system",
  };

  const [loading, setLoading] = useState<boolean>(true);

  const nodeTypes = {
    welcomeInput: ChartWelcomeInput,
    userInput: ChartUserInput,
    responseInput: ChartResponseInput,
    fallback: ChartDefaultFallback,
  };

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
      style: { fontWeight: 600, width: 250, height: 120 },
      type: "welcomeInput",
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
      type: "fallback",
      style: {
        backgroundColor: "#eff0f4",
        color: "black",
        width: 220,
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
      style: { fontWeight: 600, width: 250, height: 120 },
      type: "userInput",
    },
    {
      id: "product",
      position: { x: 0, y: 0 },
      data: { label: "User Input" },
      style: { fontWeight: 600, width: 250, height: 120 },
      type: "userInput",
    },
    {
      id: "response",
      position: { x: 0, y: 0 },
      data: { label: "Response" },
      style: { fontWeight: 600, width: 250, height: 120 },
      type: "responseInput",
    },
  ];
  const initialEdges = [
    {
      id: "1",
      source: "start",
      target: "welcome",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
      // animated: true,
    },
    {
      id: "2",
      source: "welcome",
      target: "userinput",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
      // animated: true,
    },
    {
      id: "3",
      source: "userinput",
      target: "fallback",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
      // animated: true,
    },
    {
      id: "4",
      source: "userinput",
      target: "branch",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
      // animated: true,
    },
    {
      id: "5",
      source: "userinput",
      target: "product",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
      // animated: true,
    },

    {
      id: "6",
      source: "branch",
      target: "response",
      type: "smoothstep",
      style: { stroke: "#8fba94", strokeWidth: 2 },
      // animated: true,
    },
  ];

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const ref = useRef<any>(null);
  const applyDagreLayout = () => {
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({ rankdir: "TB", ranksep: 50, nodesep: 150, edgesep: 10 });
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

    const totalWidth = windowSize.width;

    let maxX = 0;
    nodes.forEach((node: any) => {
      const nodeWidth = node.style.width || 150; // Lebar default jika tidak ada style.width
      const nodeX = graph.node(node.id).x + nodeWidth;
      maxX = Math.max(maxX, nodeX);
    });

    const flowchartWidth = maxX;

    const centerX = (totalWidth - flowchartWidth) / 2;

    const layoutedElements = nodes.map((node: any) => {
      let offsetY = 0;

      // Tambahkan margin untuk start node
      if (node.id === "start") {
        offsetY = 15; // Sesuaikan angka sesuai kebutuhan
      }

      return {
        ...node,
        position: {
          x:
            // graph.node(node.id).x - node.style.width / 2 + windowSize.width / 6,
            graph.node(node.id).x - node.style.width / 2 + centerX,
          y: graph.node(node.id).y - node.style.height / 2 + offsetY,
        },
      };
    });

    setNodes(layoutedElements);
  };

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        const { offsetWidth, offsetHeight } = ref.current;
        setWindowSize({ width: offsetWidth, height: offsetHeight });
      }
    };
    handleResize();
    applyDagreLayout();
    setLoading(false);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {Meta(metaData)}
      {loading ? (
        <LoadingComponent />
      ) : (
        <div className="flex flex-col h-[90vh]">
          <div className="border bg-white shadow-sm h-14 -mt-1 flex items-center justify-between px-4">
            <div className="flex items-center">
              <h4 className="font-bold">Sales Bot</h4>
              <CircleIcon
                style={{ fontSize: 8 }}
                className={`mr-2 text-green-600 ml-[2px] -mt-1`}
              />
              <h5 className="text-[0.75em]  text-gray-600">
                Last edit was a few seconds
              </h5>
            </div>
            <div className="flex ">
              <button className="py-1 px-2 border rounded-md text-[0.85em] font-semibold border-[#4f60a1]  text-[#4f60a1] mr-2 opacity-80 hover:opacity-100 duration-300">
                Discard
              </button>
              <button className="flex items-center justify-between py-1 px-1 border rounded-md text-[0.85em] font-semibold border-[#4f60a1]   text-[#4f60a1] mr-2  opacity-80 hover:opacity-100 duration-300">
                <h4 className="mr-[2px] ">Preview</h4>
                <PlayCircleOutlinedIcon
                  className="mt-[2px]"
                  style={{ fontSize: 15 }}
                />
              </button>
              <button className="py-1 px-2 border rounded-md text-[0.85em] font-semibold border-[#4f60a1]  text-[#4f60a1] mr-2  opacity-80 hover:opacity-100 duration-300">
                Publish
              </button>
              {/* <button>Preview</button>
          <button>Publish</button> */}
            </div>
          </div>
          <div ref={ref} style={{ width: "100%" }} className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              // fitView={true}
              // minZoom={1.2}
            >
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsappFlowChart;
