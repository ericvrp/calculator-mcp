import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { version } from "../package.json";

/**
 * Create an MCP server with calculator tools.
 */
const server = new McpServer({
  name: "Calculator", // Match server_name in tests
  version: version,
});

// Add tool
server.tool(
  "add",
  {
    numbers: z.array(z.number()).describe("An array of numbers to add"),
  },
  async ({ numbers }) => {
    const result = numbers.reduce((sum, num) => sum + num, 0);
    return {
      content: [{ type: "text", text: String(result) }],
    };
  }
);

// Subtract tool
server.tool(
  "subtract",
  {
    numbers: z.array(z.number()).describe("An array of numbers to subtract"),
  },
  async ({ numbers }) => {
    if (numbers.length === 0) {
      throw new Error("Subtraction requires at least one number");
    }
    const result = numbers.slice(1).reduce((acc, num) => acc - num, numbers[0]);
    return {
      content: [{ type: "text", text: String(result) }],
    };
  }
);

// Multiply tool
server.tool(
  "multiply",
  {
    numbers: z.array(z.number()).describe("An array of numbers to multiply"),
  },
  async ({ numbers }) => {
    const result = numbers.reduce((product, num) => product * num, 1);
    return {
      content: [{ type: "text", text: String(result) }],
    };
  }
);

// Divide tool
server.tool(
  "divide",
  {
    numbers: z.array(z.number()).describe("An array of numbers to divide"),
  },
  async ({ numbers }) => {
    if (numbers.length < 2) {
      throw new Error("Division requires at least two numbers");
    }
    const [numerator, ...denominators] = numbers;
    if (denominators.some((d) => d === 0)) {
      return {
        content: [{ type: "text", text: "Cannot divide by zero" }],
      };
    }
    const result = denominators.reduce((acc, num) => acc / num, numerator);
    return {
      content: [{ type: "text", text: String(result) }],
    };
  }
);

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

export { server };
