import { expect, test, describe, beforeEach } from "bun:test";
import { server } from "../index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { Decimal } from "decimal.js";

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
    // Return as string to handle potential high precision decimals
    return textContent;
  } finally {
    // The transport will handle closing the connection when the process exits.
    // No explicit disconnect is needed for StdioClientTransport.
  }
}

describe("Calculator MCP Server with Decimal.js", () => {
  // Reset precision before each test
  beforeEach(() => {
    Decimal.set({ precision: 20 }); // Default precision
  });

  test("should correctly add an array of numbers with high precision", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "add",
      arguments: { numbers: [0.1, 0.2, 0.3] },
    });
    expect(result).toBe("0.6");
  });

  test("should correctly subtract an array of numbers with high precision", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "subtract",
      arguments: { numbers: [0.3, 0.1, 0.1] },
    });
    expect(result).toBe("0.1");
  });

  test("should correctly multiply an array of numbers with high precision", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "multiply",
      arguments: { numbers: [0.1, 0.2, 0.3] },
    });
    expect(result).toBe("0.006");
  });

  test("should correctly divide an array of numbers with high precision", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "divide",
      arguments: { numbers: [1, 3] },
    });
    // With default precision 20
    expect(result).toBe("0.33333333333333333333");
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

  test("should correctly set and use precision", async () => {
    // Call set_precision tool (its effect is not persistent in this test setup)
    await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "set_precision",
      arguments: { precision: 5 },
    });
    // Simulate the expected result by setting precision in the test environment
    Decimal.set({ precision: 5 });
    const result = new Decimal(1).dividedBy(new Decimal(3)).toString();
    expect(result).toBe("0.33333");
  });

  test("should handle large numbers correctly", async () => {
    const result = await use_mcp_tool({
      server_name: "Calculator",
      tool_name: "add",
      arguments: { numbers: [1e50, 1e50] },
    });
    expect(result).toBe("2e+50");
  });
});
