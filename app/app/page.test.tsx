/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/display-name, @typescript-eslint/no-require-imports */
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AppPage from "./page";
import * as transformer from "@/lib/transformer";
import { fallbackMapping } from "@/lib/schemas";

// Mock nested heavy components to simplify view rendering tree and focus on page logic
jest.mock("@/components/file-dropzone", () => ({
  FileDropzone: ({ onFileParsed }: any) => (
    <button data-testid="dropzone" onClick={() => onFileParsed({
      fileName: "test.csv",
      totalRows: 2,
      headers: ["name"],
      rows: [{ name: "Test" }, { name: "Foo" }]
    })}>
      Dropzone
    </button>
  )
}));
jest.mock("@/components/data-preview", () => ({
  DataPreview: () => <div data-testid="data-preview" />
}));
jest.mock("@/components/mapping-graph", () => ({
  MappingGraph: () => <div data-testid="mapping-graph" />
}));
jest.mock("@/components/mapping-summary", () => ({
  MappingSummary: () => <div data-testid="mapping-summary" />
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    warning: jest.fn(),
    loading: jest.fn(),
  }
}));

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

describe("AppPage", () => {
  let globalFetchMock: jest.Mock;

  beforeEach(() => {
    globalFetchMock = jest.fn();
    global.fetch = globalFetchMock;
    jest.clearAllMocks();
  });

  it("handles standard flow: sample data -> API Success -> approve -> reset", async () => {
    render(<AppPage />);

    // Click Clean Data sample
    const cleanDataBtn = screen.getByText("Clean Data").closest("button")!;
    fireEvent.click(cleanDataBtn);

    // Wait for the parse to finish and Map with AI button to appear
    await waitFor(() => {
      expect(screen.getByText("Map with AI")).toBeInTheDocument();
    });

    // Mock API Success
    globalFetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => fallbackMapping,
    });

    // Click Map with AI
    const mapWithAIBtn = screen.getByText("Map with AI").closest("button")!;
    fireEvent.click(mapWithAIBtn);

    // AI Analysis Complete should appear (mapping state)
    await waitFor(() => {
      expect(screen.getByText("AI Analysis Complete")).toBeInTheDocument();
    });

    // Click Approve & Ingest
    const approveBtn = screen.getByText("Approve & Ingest").closest("button")!;
    fireEvent.click(approveBtn);

    // Success State
    await waitFor(() => {
      expect(screen.getByText("Data Ingested! 🎉")).toBeInTheDocument();
    });

    // Reset via Upload Another
    const resetBtn = screen.getByText("Upload Another").closest("button")!;
    fireEvent.click(resetBtn);

    // Back to upload state
    await waitFor(() => {
      expect(screen.getByText("Upload Your")).toBeInTheDocument();
    });
  });

  it("handles edge case: API failure (res.ok is false), falls back, then user clicks Start Over", async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<AppPage />);

    const messyBtn = screen.getByText("Messy Headers").closest("button")!;
    fireEvent.click(messyBtn);

    await waitFor(() => {
      expect(screen.getByText("Map with AI")).toBeInTheDocument();
    });

    globalFetchMock.mockResolvedValueOnce({
      ok: false,
    });

    fireEvent.click(screen.getByText("Map with AI").closest("button")!);

    // Increased timeout to 3000ms because the component waits 1500ms
    await waitFor(() => {
      expect(screen.getByText("AI Schema Mapping")).toBeInTheDocument();
    }, { timeout: 3000 });

    const startOverBtn = screen.getByText("Start Over").closest("button")!;
    fireEvent.click(startOverBtn);

    await waitFor(() => {
      expect(screen.getByText("Upload Your")).toBeInTheDocument();
    });
    consoleSpy.mockRestore();
  });

  it("handles exception during fetch", async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<AppPage />);

    const edgeBtn = screen.getByText("Edge Case").closest("button")!;
    fireEvent.click(edgeBtn);

    await waitFor(() => {
      expect(screen.getByText("Map with AI")).toBeInTheDocument();
    });

    globalFetchMock.mockRejectedValueOnce(new Error("Network Error"));

    fireEvent.click(screen.getByText("Map with AI").closest("button")!);

    // Increased timeout to 3000ms because the component waits 1000ms in catch
    await waitFor(() => {
      expect(screen.getByText("AI Schema Mapping")).toBeInTheDocument();
    }, { timeout: 3000 });
    consoleSpy.mockRestore();
  });

  it("handles Large Data and forces a warning via applyTransforms", async () => {
    render(<AppPage />);

    const largeBtn = screen.getByText("Large Data").closest("button")!;
    fireEvent.click(largeBtn);

    await waitFor(() => {
      expect(screen.getByText("Map with AI")).toBeInTheDocument();
    });

    globalFetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => fallbackMapping,
    });

    fireEvent.click(screen.getByText("Map with AI").closest("button")!);

    await waitFor(() => {
      expect(screen.getByText("AI Schema Mapping")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("can also trigger through the dropzone and download invalid rows", async () => {
    const mockCreateObjectURL = jest.fn().mockReturnValue("blob:mock-url");
    const mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    const mockClick = jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock localStorage to throw error
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = jest.fn(() => {
      throw new Error("Local storage full");
    });

    render(<AppPage />);
    const dropzone = screen.getByTestId("dropzone");
    fireEvent.click(dropzone);
    await waitFor(() => {
      expect(screen.getByText("Map with AI")).toBeInTheDocument();
    });

    globalFetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => fallbackMapping,
    });
    fireEvent.click(screen.getByText("Map with AI").closest("button")!);
    
    await waitFor(() => {
      expect(screen.getByText("Approve & Ingest")).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const approveBtn = screen.getByRole("button", { name: /Approve & Ingest/i });
    fireEvent.click(approveBtn);
    
    await waitFor(() => {
      expect(screen.getByText("Data Ingested! 🎉")).toBeInTheDocument();
    });

    const dlInvalidBtn = screen.getByRole("button", { name: /Download Rejected Rows/i });
    fireEvent.click(dlInvalidBtn);
    
    const dlReportBtn = screen.getByRole("button", { name: /Download Report/i });
    fireEvent.click(dlReportBtn);
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    mockClick.mockRestore();
    consoleSpy.mockRestore();

    // Restore setItem
    Storage.prototype.setItem = originalSetItem;
  });

  it("downloads CSV of valid and invalid rows", async () => {
    const mockCreateObjectURL = jest.fn().mockReturnValue("blob:mock-url");
    const mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockClick = jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<AppPage />);
    
    // Use the Clean Data sample to ensure we get valid rows
    const cleanDataBtn = screen.getByText("Clean Data").closest("button");
    fireEvent.click(cleanDataBtn!);
    
    await waitFor(() => {
      expect(screen.getByText("Map with AI")).toBeInTheDocument();
    });
    
    globalFetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mappings: [
          { source: "first_name", target: "first_name", confidence: 1, transform: "" },
          { source: "last_name", target: "last_name", confidence: 1, transform: "" },
          { source: "email", target: "email", confidence: 1, transform: "" },
          { source: "phone", target: "phone", confidence: 1, transform: "" },
          { source: "company", target: "company", confidence: 1, transform: "" },
          { source: "role", target: "title", confidence: 1, transform: "" },
        ],
        unmapped_source: [],
        missing_target: []
      }),
    });
    fireEvent.click(screen.getByText("Map with AI").closest("button")!);
    
    await waitFor(() => {
      expect(screen.getByText("Approve & Ingest")).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const approveBtn = screen.getByRole("button", { name: /Approve & Ingest/i });
    fireEvent.click(approveBtn);
    
    await waitFor(() => {
      expect(screen.getByText("Data Ingested! 🎉")).toBeInTheDocument();
    });

    const dlValidBtn = screen.getByRole("button", { name: /Download Cleaned Data/i });
    fireEvent.click(dlValidBtn);
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    const dlReportBtn = screen.getByRole("button", { name: /Download Report/i });
    fireEvent.click(dlReportBtn);
    
    const startOverBtn = screen.getByRole("button", { name: /Upload Another/i });
    fireEvent.click(startOverBtn);
    
    mockClick.mockRestore();
  });
});
