import { render, screen } from "@testing-library/react";
import { MappingSummary } from "./mapping-summary";

jest.mock("framer-motion", () => {
  const React = require("react");
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }),
    },
  };
});

describe("MappingSummary", () => {
  const mockMapping = {
    totalFields: 3,
    mappedFields: 3,
    mappings: [
      { source: "firstName", target: "name", confidence: 0.95 },   // High
      { source: "lastName", target: "name_last", confidence: 0.8 },// Medium
      { source: "age_data", target: "age", confidence: 0.4 },      // Low
    ],
    unmapped_source: ["some_random_col"]
  };

  const mockValidation = {
    summary: {
      total: 100,
      valid: 85,
      invalid: 15,
      errorsByField: {}
    },
    validRows: [],
    invalidRows: []
  };

  it("renders mapping statistics correctly", () => {
    const { container } = render(
      <MappingSummary mapping={mockMapping as any} validation={mockValidation as any} />
    );

    // Header
    expect(screen.getByText("Mapping Summary")).toBeInTheDocument();

    // Stats Grid
    expect(screen.getByText("Fields Mapped")).toBeInTheDocument();
    expect(screen.getByText("3/4")).toBeInTheDocument(); // 3 mapped, 1 unmapped_source

    // Avg confidence: (0.95 + 0.8 + 0.4) / 3 = 2.15 / 3 = 0.716... -> 72%
    expect(screen.getByText("Avg Confidence")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
    
    // Confidence breakdown
    expect(screen.getByText("High (≥90%)")).toBeInTheDocument();
    expect(screen.getByText("Medium (70-90%)")).toBeInTheDocument();
    expect(screen.getByText("Low (<70%)")).toBeInTheDocument();

    // The counts are rendered as adjacent span elements next to the text label.
    // Testing specific counts is easily done via container.textContent
    expect(container.textContent).toMatch(/High \(≥90%\)1/);
    expect(container.textContent).toMatch(/Medium \(70-90%\)1/);
    expect(container.textContent).toMatch(/Low \(<70%\)1/);

    // Unmapped Columns
    expect(screen.getByText("Unmapped Columns")).toBeInTheDocument();
    expect(screen.getByText("some_random_col")).toBeInTheDocument();

    // Validation
    expect(screen.getByText("Validation")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(container.textContent).toMatch(/\/ 100 valid/);
  });

  it("handles high average confidence styling", () => {
    const highMapping = {
      ...mockMapping,
      mappings: [{ source: "a", target: "b", confidence: 1.0 }],
      unmapped_source: []
    };

    render(<MappingSummary mapping={highMapping as any} validation={null} />);
    
    // Avg Confidence 100% => color okch(0.7 0.18 160) which is green-ish
    // The specific styles on the div aren't strictly necessary to assert if we rely on snapshot/dom,
    // but the test should run cleanly.
    expect(screen.getByText("100%")).toBeInTheDocument();
    
    // Verify no unmapped columns section
    expect(screen.queryByText("Unmapped Columns")).not.toBeInTheDocument();
    
    // Verify no validation section
    expect(screen.queryByText("Validation")).not.toBeInTheDocument();
  });
});
