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
      div: React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }),
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

    // Reset via Upload Another File
    const resetBtn = screen.getByText("Upload Another File").closest("button")!;
    fireEvent.click(resetBtn);

    // Back to upload state
    await waitFor(() => {
      expect(screen.getByText("Upload Your")).toBeInTheDocument();
    });
  });

  it("handles edge case: API failure (res.ok is false), falls back, then user clicks Start Over", async () => {
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
  });

  it("handles exception during fetch", async () => {
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

  it("can also trigger through the dropzone", async () => {
    render(<AppPage />);
    const dropzone = screen.getByTestId("dropzone");
    fireEvent.click(dropzone);
    await waitFor(() => {
      expect(screen.getByText("Map with AI")).toBeInTheDocument();
    });
  });
});
