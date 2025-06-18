import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { version } from "../package.json";
import { Decimal } from "decimal.js";

/**
 * Convert degrees to radians
 */
function degreesToRadians(degrees: number): Decimal {
  return new Decimal(degrees).times(Decimal.acos(-1)).dividedBy(180);
}

/**
 * Convert radians to degrees
 */
function radiansToDegrees(radians: number): Decimal {
  return new Decimal(radians).times(180).dividedBy(Decimal.acos(-1));
}

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

// Sine function
server.tool(
  "sin",
  {
    angle: z.number().describe("The angle value"),
    mode: z
      .enum(["radians", "degrees"])
      .describe("The angle mode (radians or degrees)"),
  },
  async ({ angle, mode }) => {
    let angleInRadians =
      mode === "degrees" ? degreesToRadians(angle) : new Decimal(angle);
    const result = roundTrigResult(Decimal.sin(angleInRadians));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Cosine function
server.tool(
  "cos",
  {
    angle: z.number().describe("The angle value"),
    mode: z
      .enum(["radians", "degrees"])
      .describe("The angle mode (radians or degrees)"),
  },
  async ({ angle, mode }) => {
    let angleInRadians =
      mode === "degrees" ? degreesToRadians(angle) : new Decimal(angle);
    const result = roundTrigResult(Decimal.cos(angleInRadians));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Tangent function
server.tool(
  "tan",
  {
    angle: z.number().describe("The angle value"),
    mode: z
      .enum(["radians", "degrees"])
      .describe("The angle mode (radians or degrees)"),
  },
  async ({ angle, mode }) => {
    let angleInRadians =
      mode === "degrees" ? degreesToRadians(angle) : new Decimal(angle);
    const cos = Decimal.cos(angleInRadians);

    // Check for undefined tangent at π/2 + nπ
    if (cos.isZero()) {
      return {
        content: [{ type: "text", text: "Undefined (angle is π/2 + nπ)" }],
      };
    }

    const sin = Decimal.sin(angleInRadians);
    const result = roundTrigResult(sin.dividedBy(cos));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

/**
 * Round a decimal value to a reasonable precision to match JavaScript Math functions
 */
function roundTrigResult(value: Decimal): Decimal {
  return value.toDecimalPlaces(15);
}

// Arc sine function
server.tool(
  "asin",
  {
    value: z.number().describe("The value to calculate arcsine for"),
  },
  async ({ value }) => {
    if (Math.abs(value) > 1) {
      throw new Error("Domain error: input value must be between -1 and 1");
    }
    const result = roundTrigResult(Decimal.asin(new Decimal(value)));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Arc cosine function
server.tool(
  "acos",
  {
    value: z.number().describe("The value to calculate arccosine for"),
  },
  async ({ value }) => {
    if (Math.abs(value) > 1) {
      throw new Error("Domain error: input value must be between -1 and 1");
    }
    const result = roundTrigResult(Decimal.acos(new Decimal(value)));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Arc tangent function
server.tool(
  "atan",
  {
    value: z.number().describe("The value to calculate arctangent for"),
  },
  async ({ value }) => {
    const result = roundTrigResult(Decimal.atan(new Decimal(value)));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Hyperbolic sine function
server.tool(
  "sinh",
  {
    value: z.number().describe("The value to calculate hyperbolic sine for"),
  },
  async ({ value }) => {
    const result = roundTrigResult(Decimal.sinh(new Decimal(value)));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Hyperbolic cosine function
server.tool(
  "cosh",
  {
    value: z.number().describe("The value to calculate hyperbolic cosine for"),
  },
  async ({ value }) => {
    const result = roundTrigResult(Decimal.cosh(new Decimal(value)));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Hyperbolic tangent function
server.tool(
  "tanh",
  {
    value: z.number().describe("The value to calculate hyperbolic tangent for"),
  },
  async ({ value }) => {
    const result = roundTrigResult(Decimal.tanh(new Decimal(value)));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Inverse hyperbolic sine function
server.tool(
  "asinh",
  {
    value: z
      .number()
      .describe("The value to calculate inverse hyperbolic sine for"),
  },
  async ({ value }) => {
    const result = Decimal.asinh(new Decimal(value));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Inverse hyperbolic cosine function
server.tool(
  "acosh",
  {
    value: z
      .number()
      .describe("The value to calculate inverse hyperbolic cosine for"),
  },
  async ({ value }) => {
    if (value < 1) {
      throw new Error(
        "Domain error: input value must be greater than or equal to 1"
      );
    }
    const result = roundTrigResult(Decimal.acosh(new Decimal(value)));
    return {
      content: [{ type: "text", text: result.toString() }],
    };
  }
);

// Inverse hyperbolic tangent function
server.tool(
  "atanh",
  {
    value: z
      .number()
      .describe("The value to calculate inverse hyperbolic tangent for"),
  },
  async ({ value }) => {
    if (Math.abs(value) >= 1) {
      throw new Error("Domain error: input value must be between -1 and 1");
    }
    const result = roundTrigResult(Decimal.atanh(new Decimal(value)));
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
