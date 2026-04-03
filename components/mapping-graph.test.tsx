/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/display-name, @typescript-eslint/no-require-imports */
import { render, screen, fireEvent } from "@testing-library/react";
import { MappingGraph } from "./mapping-graph";

const mockFitView = jest.fn();

jest.mock("@xyflow/react", () => {
  return {
    ReactFlowProvider: ({ children }: any) => <>{children}</>,
    ReactFlow: (props: any) => (
      <div 
        data-testid="react-flow" 
        data-nodes={JSON.stringify(props.nodes)} 
        data-edges={JSON.stringify(props.edges)} 
      />
    ),
    useReactFlow: () => ({ fitView: mockFitView }),
    Position: {
      Left: "left",
      Right: "right",
      Top: "top",
      Bottom: "bottom"
    }
  };
});

jest.mock("framer-motion", () => {
   
  const React = require("react");
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: Object.assign(React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }), { displayName: "MotionDiv" }),
      span: Object.assign(React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }), { displayName: "MotionSpan" }),
      a: Object.assign(React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }), { displayName: "MotionA" }),
      button: Object.assign(React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }), { displayName: "MotionButton" }),
      p: Object.assign(React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }), { displayName: "MotionP" }),
      h1: Object.assign(React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }), { displayName: "MotionH1" }),
      h2: Object.assign(React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }), { displayName: "MotionH2" }),
      h3: Object.assign(React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }), { displayName: "MotionH3" }),
    },
  };
});

jest.mock("@/lib/schemas", () => ({
  targetSchema: {
    name: { type: "string", required: true },
    age: { type: "number", required: false },
    email: { type: "string", required: true }
  }
}));

describe("MappingGraph", () => {
  let resizeCallback: (() => void) | null = null;
  const originalRAF = window.requestAnimationFrame;

  beforeEach(() => {
    jest.clearAllMocks();
    resizeCallback = null;
    // Mock ResizeObserver to capture the callback
    (window as any).ResizeObserver = class {
      constructor(cb: () => void) { resizeCallback = cb; }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    // Make rAF synchronous so the fitView call inside executes immediately
    window.requestAnimationFrame = (cb: FrameRequestCallback) => { cb(0); return 0; };
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRAF;
  });

  const sourceHeaders = ["firstName", "lastName", "age_header", "email_address", "unmapped_source"];
  
  const mapping = {
    totalFields: 3,
    mappedFields: 2,
    mappings: [
      { source: "firstName", target: "name", confidence: 0.9 },
      { source: "age_header", target: "age", confidence: 0.5 },
    ]
  };

  it("renders correctly with formatted nodes and edges", () => {
    render(<MappingGraph mapping={mapping as any} sourceHeaders={sourceHeaders} />);
    
    // Check if the ReactFlow was rendered
    const flowControl = screen.getByTestId("react-flow");
    expect(flowControl).toBeInTheDocument();

    const nodesData = JSON.parse(flowControl.getAttribute("data-nodes") || "[]");
    const edgesData = JSON.parse(flowControl.getAttribute("data-edges") || "[]");

    // 5 Source + 3 Target = 8 nodes total
    expect(nodesData.length).toBe(8);

    // 2 mappings = 2 edges
    expect(edgesData.length).toBe(2);

    // Verify source node formatting
    const firstNameNode = nodesData.find((n: any) => n.id === "source-firstName");
    expect(firstNameNode.data.isUnmapped).toBe(false);
    expect(firstNameNode.data.confidence).toBe(0.9);

    const unmappedSourceNode = nodesData.find((n: any) => n.id === "source-unmapped_source");
    expect(unmappedSourceNode.data.isUnmapped).toBe(true);
    expect(unmappedSourceNode.data.confidence).toBeUndefined();

    // Verify target node formatting
    const nameTargetNode = nodesData.find((n: any) => n.id === "target-name");
    expect(nameTargetNode.data.isUnmapped).toBe(false); // Because it is mapped

    const emailTargetNode = nodesData.find((n: any) => n.id === "target-email");
    expect(emailTargetNode.data.isUnmapped).toBe(true); // Because it is required and NOT mapped

    const ageTargetNode = nodesData.find((n: any) => n.id === "target-age");
    expect(ageTargetNode.data.isUnmapped).toBe(false); // Because it is NOT required, even though it is mapped here

    // Edges
    const firstEdge = edgesData.find((e: any) => e.source === "source-firstName");
    expect(firstEdge.target).toBe("target-name");
    expect(firstEdge.data.confidence).toBe(0.9);
  });

  it("triggers fitView when Reset View is clicked", () => {
    render(<MappingGraph mapping={mapping as any} sourceHeaders={sourceHeaders} />);

    const resetBtn = screen.getByRole("button", { name: /reset view/i });
    fireEvent.click(resetBtn);

    expect(mockFitView).toHaveBeenCalledWith({ padding: 0.15, duration: 800, maxZoom: 1 });
  });

  it("calls fitView via ResizeObserver when container resizes", () => {
    render(<MappingGraph mapping={mapping as any} sourceHeaders={sourceHeaders} />);

    // The ResizeObserver callback should have been captured during mount
    expect(resizeCallback).not.toBeNull();

    // Simulate a resize event
    resizeCallback!();

    // fitView is called once by ResizeObserver (via synchronous rAF)
    expect(mockFitView).toHaveBeenCalledWith({ padding: 0.15, duration: 300, maxZoom: 1 });
  });
});
