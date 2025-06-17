import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { version } from "../package.json";
import { Decimal } from "decimal.js";

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
    let result = new Decimal(0);
    for (const num of numbers) {
      result = result.plus(new Decimal(num));
    }
    return {
      content: [{ type: "text", text: result.toString() }],
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
    const decimalNumbers = numbers.map((num) => new Decimal(num));
    let result = decimalNumbers[0];
    for (let i = 1; i < decimalNumbers.length; i++) {
      result = result.minus(decimalNumbers[i]);
    }
    return {
      content: [{ type: "text", text: result.toString() }],
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
    let result = new Decimal(1);
    for (const num of numbers) {
      result = result.times(new Decimal(num));
    }
    return {
      content: [{ type: "text", text: result.toString() }],
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
    const [numeratorDecimal, ...denominatorsDecimal] = numbers.map(
      (num) => new Decimal(num)
    );
    let result = numeratorDecimal;
    for (const num of denominatorsDecimal) {
      if (num.isZero()) {
        return {
          content: [{ type: "text", text: "Cannot divide by zero" }],
        };
      }
      result = result.dividedBy(num);
    }
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Set precision tool
server.tool(
  "set_precision",
  {
    precision: z.number().describe("The number of decimal places to use"),
  },
  async ({ precision }) => {
    Decimal.set({ precision });
    return {
      content: [{ type: "text", text: `Precision set to ${precision}` }],
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
