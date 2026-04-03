import { render, screen, fireEvent } from "@testing-library/react";
import { DataPreview } from "./data-preview";

// Mock framer-motion minimally
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

// Since DataPreview uses components/ui components with SVGs from lucide-react, we don't necessarily need to mock them, 
// they render natively in JSDOM unless there's dynamic imports.

describe("DataPreview", () => {
  const baseData = {
    fileName: "test.csv",
    totalRows: 3,
    headers: ["name", "age", "email"],
    rows: [
      ["Alice", "30", "alice@test.com"],
      ["Bob", "40", "bob@test.com"],
      ["Empty", "", ""], // empty cell testing
    ],
  };

  it("renders headers and rows correctly", () => {
    render(<DataPreview data={baseData} maxRows={10} />);
    
    // Check headers
    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("age")).toBeInTheDocument();
    expect(screen.getByText("email")).toBeInTheDocument();

    // Check cells
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    // Check empty state
    const emptyCells = screen.getAllByText("empty");
    expect(emptyCells).toHaveLength(2);
  });

  it("paginates correctly when totalRows > maxRows", () => {
    const manyRowsData = {
      ...baseData,
      totalRows: 15,
      rows: Array.from({ length: 15 }).map((_, i) => [`User ${i + 1}`, "20", "user@test.com"]),
    };

    render(<DataPreview data={manyRowsData} maxRows={10} />);

    // Should see "Page 1 of 2"
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    // Should see "Showing 1-10 of 15"
    expect(screen.getByText("Showing 1-10 of 15")).toBeInTheDocument();

    // Click Next
    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    // Should see "Showing 11-15 of 15"
    expect(screen.getByText("Showing 11-15 of 15")).toBeInTheDocument();
    
    // User 15 should be visible now
    expect(screen.getByText("User 15")).toBeInTheDocument();

    // Click Prev
    const prevBtn = screen.getByRole("button", { name: /prev/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("highlights invalid rows and shows error tooltip when validation provided", () => {
    const validation = {
      validRows: [],
      invalidRows: [
        {
          rowIndex: 1, // 0-indexed, so Bob
          errors: ["Invalid age format"],
          row: { name: "Bob", age: "40", email: "bob@test.com" }
        }
      ],
      summary: { total: 0, valid: 0, invalid: 0, errorsByField: {} }
    } as any;

    const { container } = render(<DataPreview data={baseData} maxRows={10} validation={validation} />);

    // Check if error is displayed for Bob row
    expect(screen.getByText("Invalid age format")).toBeInTheDocument();
    
    // The tr element for Bob should have bg-destructive/8
    const errorText = screen.getByText("Invalid age format");
    const tr = errorText.closest("tr");
    expect(tr?.className).toContain("bg-destructive/8");
  });
});
