/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/display-name, @typescript-eslint/no-require-imports */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HistoryPage from "./page";

// Mock framer-motion minimally
jest.mock("framer-motion", () => {
  const React = require("react");
  const actual = jest.requireActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: Object.assign(React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }), { displayName: "MotionDiv" }),
    },
  };
});

describe("HistoryPage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renders empty state when no history exists", async () => {
    render(<HistoryPage />);
    
    // Fast-forward setTimeout in useEffect
    jest.runAllTimers();

    await waitFor(() => {
      expect(screen.getByText("No history yet")).toBeInTheDocument();
    });
  });

  it("renders history entries from localStorage", async () => {
    const mockHistory = [
      {
        id: "test1",
        date: new Date("2023-01-01T12:00:00Z").toISOString(),
        fileName: "dataset1.csv",
        totalRows: 100,
        validRows: 90,
        invalidRows: 10,
        mappedFieldsCount: 5,
      },
      {
        id: "test2",
        date: new Date("2023-01-02T12:00:00Z").toISOString(),
        fileName: "dataset2.csv",
        totalRows: 50,
        validRows: 50,
        invalidRows: 0,
        mappedFieldsCount: 3,
      }
    ];

    localStorage.setItem("shiftsync_history", JSON.stringify(mockHistory));

    render(<HistoryPage />);
    jest.runAllTimers();

    await waitFor(() => {
      expect(screen.getByText("dataset1.csv")).toBeInTheDocument();
      expect(screen.getByText("dataset2.csv")).toBeInTheDocument();
    });

    // Check tags
    expect(screen.getByText("Partial")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    
    expect(screen.getByText("90 / 100")).toBeInTheDocument();
    expect(screen.getByText("50 / 50")).toBeInTheDocument();
  });

  it("clears history when Clear History button is clicked", async () => {
    const mockHistory = [
      {
        id: "test1",
        date: new Date("2023-01-01T12:00:00Z").toISOString(),
        fileName: "dataset1.csv",
        totalRows: 100,
        validRows: 90,
        invalidRows: 10,
        mappedFieldsCount: 5,
      }
    ];

    localStorage.setItem("shiftsync_history", JSON.stringify(mockHistory));

    render(<HistoryPage />);
    jest.runAllTimers();

    await waitFor(() => {
      expect(screen.getByText("dataset1.csv")).toBeInTheDocument();
    });

    const clearBtn = screen.getByText("Clear History").closest("button")!;
    fireEvent.click(clearBtn);

    expect(screen.queryByText("dataset1.csv")).not.toBeInTheDocument();
    expect(localStorage.getItem("shiftsync_history")).toBeNull();
    expect(screen.getByText("No history yet")).toBeInTheDocument();
  });

  it("handles broken localStorage data gracefully", async () => {
    localStorage.setItem("shiftsync_history", "broken json {");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    render(<HistoryPage />);
    jest.runAllTimers();

    await waitFor(() => {
      expect(screen.getByText("No history yet")).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
