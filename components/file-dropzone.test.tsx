import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileDropzone } from "./file-dropzone";
import { parseFile } from "@/lib/parser";

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
      p: React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, variants, transition, ...rest } = props;
        return <p ref={ref} {...rest} />;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

jest.mock("@/lib/parser", () => ({
  parseFile: jest.fn(),
}));

describe("FileDropzone", () => {
  const mockOnFileParsed = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createFile = (name = "test.csv", size = 1024) => {
    const file = new File(["dummy content"], name, { type: "text/csv" });
    Object.defineProperty(file, "size", { value: size });
    return file;
  };

  it("renders idle state initially", () => {
    render(<FileDropzone onFileParsed={mockOnFileParsed} />);
    expect(screen.getByText("Drag & drop your CSV file here")).toBeInTheDocument();
  });

  it("handles file input change and successful parsing", async () => {
    const mockParsedData = {
      fileName: "test.csv",
      totalRows: 1,
      headers: ["col1"],
      rows: [["val1"]],
    };
    (parseFile as jest.Mock).mockResolvedValueOnce(mockParsedData);

    render(<FileDropzone onFileParsed={mockOnFileParsed} />);

    // In testing-library we can't easily click the div and have the hidden input open the dialog,
    // but we can just fire a change event on the hidden input directly.
    // However, the test queries via file input. Wait, the input has a type="file" but no label. 
    // We can select it by type or role.
    // There's only one.
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile();
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(parseFile).toHaveBeenCalledWith(file);
    });
    
    expect(mockOnFileParsed).toHaveBeenCalledWith(mockParsedData);

    // It should now display the filename
    expect(screen.getByText("test.csv")).toBeInTheDocument();
    expect(screen.getByText("File loaded — ready to map")).toBeInTheDocument();
  });

  it("shows error when parseFile fails", async () => {
    (parseFile as jest.Mock).mockRejectedValueOnce(new Error("Parse error"));

    render(<FileDropzone onFileParsed={mockOnFileParsed} />);
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile();
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Parse error")).toBeInTheDocument();
    });

    // FileName should be null again, showing idle state
    expect(screen.getByText("Drag & drop your CSV file here")).toBeInTheDocument();
  });

  it("shows default error when parseFile fails with non-Error", async () => {
    (parseFile as jest.Mock).mockRejectedValueOnce("Just a string error");

    render(<FileDropzone onFileParsed={mockOnFileParsed} />);
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile();
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Failed to parse file")).toBeInTheDocument();
    });
  });

  it("allows clearing the file after successful parse", async () => {
    const mockParsedData = {
      fileName: "test.csv",
      totalRows: 1,
      headers: ["col1"],
      rows: [["val1"]],
    };
    (parseFile as jest.Mock).mockResolvedValueOnce(mockParsedData);

    render(<FileDropzone onFileParsed={mockOnFileParsed} />);
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createFile();
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("test.csv")).toBeInTheDocument();
    });

    // Click X button
    // It's the only button in that state
    const clearBtn = screen.getByRole("button");
    fireEvent.click(clearBtn);

    // Should return to idle
    expect(screen.getByText("Drag & drop your CSV file here")).toBeInTheDocument();
  });

  it("handles drag and drop events", async () => {
    const mockParsedData = {
      fileName: "test.csv",
      totalRows: 1,
      headers: ["col1"],
      rows: [["val1"]],
    };
    (parseFile as jest.Mock).mockResolvedValueOnce(mockParsedData);

    const { container } = render(<FileDropzone onFileParsed={mockOnFileParsed} />);

    const dropzone = container.querySelector(".dropzone-idle") as HTMLElement;

    // Drag over
    fireEvent.dragOver(dropzone);
    expect(dropzone.className).toContain("dropzone-active");

    // Drag leave
    fireEvent.dragLeave(dropzone);
    expect(dropzone.className).toContain("dropzone-idle");

    // Drop
    const file = createFile();
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(parseFile).toHaveBeenCalledWith(file);
    });
    
    expect(mockOnFileParsed).toHaveBeenCalledWith(mockParsedData);
  });

  it("ignores clicks/interactions when isLoading is true", () => {
    const { container } = render(<FileDropzone onFileParsed={mockOnFileParsed} isLoading={true} />);

    const dropzone = container.querySelector(".dropzone-idle, .dropzone-active") as HTMLElement;
    expect(dropzone.className).toContain("pointer-events-none");
    expect(dropzone.className).toContain("opacity-60");
  });

  it("does not trigger input click if fileName is set", async () => {
    const mockParsedData = {
      fileName: "test.csv",
      totalRows: 1,
      headers: ["col1"],
      rows: [["val1"]],
    };
    (parseFile as jest.Mock).mockResolvedValueOnce(mockParsedData);

    const { container } = render(<FileDropzone onFileParsed={mockOnFileParsed} />);

    // Mock input click
    const clickSpy = jest.spyOn(HTMLInputElement.prototype, "click");
    
    // Simulate initial drop
    const dropzone = container.querySelector(".dropzone-idle") as HTMLElement;
    const file = createFile();
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [file] },
    });
    
    await waitFor(() => {
      expect(screen.getByText("test.csv")).toBeInTheDocument();
    });
    
    clickSpy.mockClear();

    // Now click the dropzone again
    fireEvent.click(dropzone);
    
    // Should NOT have called click because fileName is set
    expect(clickSpy).not.toHaveBeenCalled();
  });
});
