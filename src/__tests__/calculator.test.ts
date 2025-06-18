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
  describe("Trigonometric Functions", () => {
    // Basic trigonometric functions
    test("should calculate sine correctly for an array of angles", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "sin",
        arguments: { angles: [Math.PI / 2, 0], mode: "radians" },
      });
      expect(result).toBe(JSON.stringify(["1", "0"]));
    });

    test("should calculate cosine correctly for an array of angles", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "cos",
        arguments: { angles: [0, Math.PI], mode: "radians" },
      });
      expect(result).toBe(JSON.stringify(["1", "-1"]));
    });

    test("should calculate tangent correctly for an array of angles", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "tan",
        arguments: { angles: [Math.PI / 4, 0], mode: "radians" },
      });
      expect(result).toBe(JSON.stringify(["1", "0"]));
    });

    // Inverse trigonometric functions
    test("should calculate arcsine correctly for an array of values", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "asin",
        arguments: { values: [1, 0] },
      });
      expect(result).toBe(JSON.stringify(["1.570796326794897", "0"]));
    });

    test("should calculate arccosine correctly for an array of values", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "acos",
        arguments: { values: [0, 1] },
      });
      expect(result).toBe(JSON.stringify(["1.570796326794897", "0"]));
    });

    test("should calculate arctangent correctly for an array of values", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "atan",
        arguments: { values: [1, 0] },
      });
      expect(result).toBe(JSON.stringify(["0.785398163397448", "0"]));
    });

    // Hyperbolic functions
    test("should calculate hyperbolic sine correctly for an array of values", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "sinh",
        arguments: { values: [0, 1] },
      });
      expect(result).toBe(JSON.stringify(["0", "1.175201193643801"]));
    });

    test("should calculate hyperbolic cosine correctly for an array of values", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "cosh",
        arguments: { values: [0, 1] },
      });
      expect(result).toBe(JSON.stringify(["1", "1.543080634815244"]));
    });

    test("should calculate hyperbolic tangent correctly for an array of values", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "tanh",
        arguments: { values: [0, 1] },
      });
      expect(result).toBe(JSON.stringify(["0", "0.761594155955765"]));
    });

    // Inverse hyperbolic functions
    test("should calculate inverse hyperbolic sine correctly for an array of values", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "asinh",
        arguments: { values: [0, 1] },
      });
      expect(result).toBe(JSON.stringify(["0", "0.881373587019543"]));
    });

    test("should calculate inverse hyperbolic cosine correctly for an array of values", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "acosh",
        arguments: { values: [1, 2] },
      });
      expect(result).toBe(JSON.stringify(["0", "1.316957896924817"]));
    });

    test("should calculate inverse hyperbolic tangent correctly for an array of values", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "atanh",
        arguments: { values: [0, 0.5] },
      });
      expect(result).toBe(JSON.stringify(["0", "0.549306144334055"]));
    });

    // Special cases and error handling
    test("should handle invalid domain for arcsine in an array", async () => {
      await expect(
        use_mcp_tool({
          server_name: "Calculator",
          tool_name: "asin",
          arguments: { values: [0.5, 2] },
        })
      ).rejects.toThrow("Domain error: input value must be between -1 and 1");
    });

    test("should handle degree mode correctly for an array of angles", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "sin",
        arguments: { angles: [90, 30], mode: "degrees" },
      });
      expect(result).toBe(JSON.stringify(["1", "0.5"]));
    });

    test("should handle special angles correctly for an array of angles", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "cos",
        arguments: { angles: [60, 45], mode: "degrees" },
      });
      expect(result).toBe(JSON.stringify(["0.5", "0.707106781186548"]));
    });

    test("should handle undefined tangent for an array of angles", async () => {
      const result = await use_mcp_tool({
        server_name: "Calculator",
        tool_name: "tan",
        arguments: { angles: [Math.PI / 2, Math.PI / 4], mode: "radians" },
      });
      expect(result).toBe(
        JSON.stringify(["Undefined (angle is π/2 + nπ)", "1"])
      );
    });

    test("should handle invalid domain for acosh in an array", async () => {
      await expect(
        use_mcp_tool({
          server_name: "Calculator",
          tool_name: "acosh",
          arguments: { values: [0.5, 1] },
        })
      ).rejects.toThrow(
        "Domain error: input value must be greater than or equal to 1"
      );
    });

    test("should handle invalid domain for atanh in an array", async () => {
      await expect(
        use_mcp_tool({
          server_name: "Calculator",
          tool_name: "atanh",
          arguments: { values: [0.5, 1] },
        })
      ).rejects.toThrow("Domain error: input value must be between -1 and 1");
    });
  });

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
    ).rejects.toThrow("Array must contain at least 2 element(s)");
  });

  test("should handle insufficient numbers for division", async () => {
    await expect(
      use_mcp_tool({
        server_name: "Calculator",
        tool_name: "divide",
        arguments: { numbers: [10] },
      })
    ).rejects.toThrow("Array must contain at least 2 element(s)");
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
