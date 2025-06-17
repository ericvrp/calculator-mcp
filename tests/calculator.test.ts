import { expect, test, describe } from "bun:test";
import { server } from "../src/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

type Schema = Record<string, any>;

interface ToolResult {
  isError?: boolean;
  content: [{ type: string; text: string }];
}

// Helper function to simulate use_mcp_tool for testing
async function use_mcp_tool(args: {
  server_name: string;
  tool_name: string;
  arguments: Record<string, any>;
}): Promise<any> {
  const transport = new StdioClientTransport({
    command: "bun",
    args: ["src/index.ts"],
  });

  const client = new Client({
    name: "test-client",
    version: "1.0.0",
  });

  try {
    await client.connect(transport);
    const result = (await client.callTool({
      name: args.tool_name,
      arguments: args.arguments,
    })) as unknown as ToolResult;

    if (result.isError) {
      throw new Error(result.content[0].text);
    }

    // Assuming the tool returns a single text content
    const textContent = result.content[0].text;
    const number = Number(textContent);
    return isNaN(number) ? textContent : number;
  } finally {
    // The transport will handle closing the connection when the process exits.
    // No explicit disconnect is needed for StdioClientTransport.
  }
}

describe("Calculator MCP Server", () => {
  test("should correctly add an array of numbers", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "add",
      arguments: { numbers: [5, 3, 2] },
    });
    expect(result).toBe(10);
  });

  test("should correctly subtract an array of numbers", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "subtract",
      arguments: { numbers: [10, 4, 1] },
    });
    expect(result).toBe(5);
  });

  test("should correctly multiply an array of numbers", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "multiply",
      arguments: { numbers: [2, 6, 2] },
    });
    expect(result).toBe(24);
  });

  test("should correctly divide an array of numbers", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "divide",
      arguments: { numbers: [20, 2, 5] },
    });
    expect(result).toBe(2);
  });

  test("should handle division by zero in an array", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "divide",
      arguments: { numbers: [5, 2, 0] },
    });
    expect(result).toBe("Cannot divide by zero");
  });

  test("should handle empty array for subtraction", async () => {
    await expect(
      use_mcp_tool({
        server_name: "Calculator",
        tool_name: "subtract",
        arguments: { numbers: [] },
      })
    ).rejects.toThrow("Subtraction requires at least one number");
  });

  test("should handle insufficient numbers for division", async () => {
    await expect(
      use_mcp_tool({
        server_name: "Calculator",
        tool_name: "divide",
        arguments: { numbers: [10] },
      })
    ).rejects.toThrow("Division requires at least two numbers");
  });
});
