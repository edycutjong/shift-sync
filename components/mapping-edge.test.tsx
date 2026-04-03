/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { render } from "@testing-library/react";
import { ConfidenceEdge } from "./mapping-edge";

// Mock @xyflow/react
jest.mock("@xyflow/react", () => ({
  BaseEdge: ({ interactionWidth: _interactionWidth, ...props }: any) => <path data-testid="base-edge" {...props} />,
  getBezierPath: jest.fn(() => ["M0,0 C50,0 50,100 100,100", 50, 50]),
}));

describe("ConfidenceEdge", () => {
  it("renders correctly with high confidence", () => {
    const data = { confidence: 0.95 };
    const { container } = render(
      <svg>
        <ConfidenceEdge
          id="edge-1"
          source="source-1"
          target="target-1"
          sourceX={0}
          sourceY={0}
          targetX={100}
          targetY={100}
          sourcePosition={"right" as any}
          targetPosition={"left" as any}
          data={data}
        />
      </svg>
    );

    const text = container.querySelector("div");
    expect(text).toHaveTextContent("95%");
  });

  it("renders correctly with low confidence", () => {
    const data = { confidence: 0.2 };
    const { container } = render(
      <svg>
        <ConfidenceEdge
          id="edge-1"
          source="source-1"
          target="target-1"
          sourceX={0}
          sourceY={0}
          targetX={100}
          targetY={100}
          sourcePosition={"right" as any}
          targetPosition={"left" as any}
          data={data}
        />
      </svg>
    );

    const text = container.querySelector("div");
    expect(text).toHaveTextContent("20%");
  });

  it("handles missing confidence gracefully", () => {
    const { container } = render(
      <svg>
        <ConfidenceEdge
          id="edge-1"
          source="source-1"
          target="target-1"
          sourceX={0}
          sourceY={0}
          targetX={100}
          targetY={100}
          sourcePosition={"right" as any}
          targetPosition={"left" as any}
          data={{} as any}
        />
      </svg>
    );

    const text = container.querySelector("div");
    expect(text).toHaveTextContent("50%"); // Check fallback
  });

  it("covers amber mid-tier confidence", () => {
    const data = { confidence: 0.8 };
    const { container } = render(
      <svg>
        <ConfidenceEdge
          id="edge-1"
          source="source-1"
          target="target-1"
          sourceX={0}
          sourceY={0}
          targetX={100}
          targetY={100}
          sourcePosition={"right" as any}
          targetPosition={"left" as any}
          data={data}
        />
      </svg>
    );

    const text = container.querySelector("div");
    expect(text).toHaveTextContent("80%");
  });
});
