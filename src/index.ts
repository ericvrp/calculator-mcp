import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

/**
 * Create an MCP server with capabilities for tools (for calculator operations).
 */
const server = new Server(
  {
    name: "Calculator MCP",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  }
);

/**
 * Handler that lists available tools.
 * Exposes calculator tools (add, subtract, multiply, divide).
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "add",
        description: "Adds two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" },
          },
          required: ["a", "b"],
        },
      },
      {
        name: "subtract",
        description: "Subtracts two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" },
          },
          required: ["a", "b"],
        },
      },
      {
        name: "multiply",
        description: "Multiplies two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "First number" },
            b: { type: "number", description: "Second number" },
          },
          required: ["a", "b"],
        },
      },
      {
        name: "divide",
        description: "Divides two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "Numerator" },
            b: { type: "number", description: "Denominator" },
          },
          required: ["a", "b"],
        },
      },
    ],
  };
});

/**
 * Handler for calculator tools.
 * Performs the requested operation (add, subtract, multiply, divide) on two numbers.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const a = Number(request.params.arguments?.a);
  const b = Number(request.params.arguments?.b);

  if (isNaN(a) || isNaN(b)) {
    throw new Error("Both inputs must be numbers.");
  }

  let result: number;
  switch (request.params.name) {
    case "add":
      result = a + b;
      break;
    case "subtract":
      result = a - b;
      break;
    case "multiply":
      result = a * b;
      break;
    case "divide":
      if (b === 0) {
        throw new Error("Division by zero is not allowed.");
      }
      result = a / b;
      break;
    default:
      throw new Error("Unknown tool");
  }

  return {
    content: [
      {
        type: "text",
        text: String(result),
      },
    ],
  };
});

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
