/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
const mockParse = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => {
      return {
        status: init?.status || 200,
        json: async () => body,
      };
    }),
  },
}));

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          parse: (...args: any[]) => mockParse(...args),
        },
      },
    };
  });
});

import { POST } from "./route";
import { NextResponse } from "next/server";
import OpenAI from "openai";

describe("POST /api/map", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockOpenAI: unknown;

  beforeAll(() => {
    originalEnv = process.env;
    if (!global.structuredClone) {
      global.structuredClone = (val: unknown) => JSON.parse(JSON.stringify(val));
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockOpenAI = (OpenAI as unknown as jest.Mock).mock.results[0]?.value;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const createMockRequest = (body: unknown) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as Request;
  };

  it("returns 400 if headers or sampleRows are missing", async () => {
    const req = createMockRequest({});
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Missing headers or sampleRows");
  });

  it("returns 500 if OPENAI_API_KEY is not set", async () => {
    delete process.env.OPENAI_API_KEY;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const req = createMockRequest({
      headers: ["name"],
      sampleRows: [["John"]],
    });
    
    // We already mock process.env, but the API route initializes the OpenAI client outside the handler
    // Wait, since OpenAI is initialized outside the POST handler, `process.env.OPENAI_API_KEY` is checked inside.
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("No API Key");
    consoleSpy.mockRestore();
  });

  it("successfully returns parsed mapping if API key exists", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    
    const mockParsedResponse = {
      mappings: [],
      unmapped_source: [],
      missing_target: [],
    };

    mockParse.mockResolvedValueOnce({
      choices: [
        { message: { parsed: mockParsedResponse } }
      ]
    });

    const req = createMockRequest({
      headers: ["name"],
      sampleRows: [["John"]],
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(mockParsedResponse);
  });

  it("defaults Sample Rows if sampleRows is empty array", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    
    // Using empty array forces `sampleRows[0] || []`
    mockParse.mockResolvedValueOnce({
      choices: [{ message: { parsed: {} } }]
    });

    const req = createMockRequest({
      headers: ["name"],
      sampleRows: [],
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("returns 500 when openai throws an error", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    
    mockParse.mockRejectedValueOnce(new Error("API limits exceeded"));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = createMockRequest({
      headers: ["name"],
      sampleRows: [["John"]],
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBe("Failed to generate mapping");
    consoleSpy.mockRestore();
  });
});
