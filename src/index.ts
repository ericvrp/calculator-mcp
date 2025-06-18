import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { version } from "../package.json";
import { Decimal } from "decimal.js";

// Define shared Zod schemas for DRY principle
const NumbersArraySchema = z
  .array(z.number())
  .min(2)
  .describe("An array of numbers (minimum 2)");

const AnglesArraySchema = z
  .array(z.number())
  .describe("An array of angle values");

const ModeEnumSchema = z
  .enum(["radians", "degrees"])
  .optional()
  .default("radians")
  .describe("The angle mode (radians or degrees), defaults to radians");

const ValuesArraySchema = z.array(z.number()).describe("An array of values");

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
    numbers: NumbersArraySchema,
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
    numbers: NumbersArraySchema,
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
    numbers: NumbersArraySchema,
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
    numbers: NumbersArraySchema,
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
    angles: AnglesArraySchema,
    mode: ModeEnumSchema,
  },
  async ({ angles, mode }) => {
    const results = angles.map((angle) => {
      let angleInRadians =
        mode === "degrees" ? degreesToRadians(angle) : new Decimal(angle);
      return roundTrigResult(Decimal.sin(angleInRadians)).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Cosine function
server.tool(
  "cos",
  {
    angles: AnglesArraySchema,
    mode: ModeEnumSchema,
  },
  async ({ angles, mode }) => {
    const results = angles.map((angle) => {
      let angleInRadians =
        mode === "degrees" ? degreesToRadians(angle) : new Decimal(angle);
      return roundTrigResult(Decimal.cos(angleInRadians)).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Tangent function
server.tool(
  "tan",
  {
    angles: AnglesArraySchema,
    mode: ModeEnumSchema,
  },
  async ({ angles, mode }) => {
    const results = angles.map((angle) => {
      let angleInRadians =
        mode === "degrees" ? degreesToRadians(angle) : new Decimal(angle);
      const cos = Decimal.cos(angleInRadians);

      // Check for undefined tangent at π/2 + nπ
      // Use a small epsilon to account for floating point inaccuracies
      const EPSILON = new Decimal("1e-15"); // Define a small epsilon
      if (cos.abs().lessThan(EPSILON)) {
        return "Undefined (angle is π/2 + nπ)";
      }

      const sin = Decimal.sin(angleInRadians);
      return roundTrigResult(sin.dividedBy(cos)).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
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
    values: ValuesArraySchema,
  },
  async ({ values }) => {
    const results = values.map((value) => {
      if (Math.abs(value) > 1) {
        throw new Error("Domain error: input value must be between -1 and 1");
      }
      return roundTrigResult(Decimal.asin(new Decimal(value))).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Arc cosine function
server.tool(
  "acos",
  {
    values: ValuesArraySchema,
  },
  async ({ values }) => {
    const results = values.map((value) => {
      if (Math.abs(value) > 1) {
        throw new Error("Domain error: input value must be between -1 and 1");
      }
      return roundTrigResult(Decimal.acos(new Decimal(value))).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Arc tangent function
server.tool(
  "atan",
  {
    values: ValuesArraySchema,
  },
  async ({ values }) => {
    const results = values.map((value) => {
      return roundTrigResult(Decimal.atan(new Decimal(value))).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Hyperbolic sine function
server.tool(
  "sinh",
  {
    values: ValuesArraySchema,
  },
  async ({ values }) => {
    const results = values.map((value) => {
      return roundTrigResult(Decimal.sinh(new Decimal(value))).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Hyperbolic cosine function
server.tool(
  "cosh",
  {
    values: ValuesArraySchema,
  },
  async ({ values }) => {
    const results = values.map((value) => {
      return roundTrigResult(Decimal.cosh(new Decimal(value))).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Hyperbolic tangent function
server.tool(
  "tanh",
  {
    values: ValuesArraySchema,
  },
  async ({ values }) => {
    const results = values.map((value) => {
      return roundTrigResult(Decimal.tanh(new Decimal(value))).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Inverse hyperbolic sine function
server.tool(
  "asinh",
  {
    values: ValuesArraySchema,
  },
  async ({ values }) => {
    const results = values.map((value) => {
      return roundTrigResult(Decimal.asinh(new Decimal(value))).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Inverse hyperbolic cosine function
server.tool(
  "acosh",
  {
    values: ValuesArraySchema,
  },
  async ({ values }) => {
    const results = values.map((value) => {
      if (value < 1) {
        throw new Error(
          "Domain error: input value must be greater than or equal to 1"
        );
      }
      return roundTrigResult(Decimal.acosh(new Decimal(value))).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
    };
  }
);

// Inverse hyperbolic tangent function
server.tool(
  "atanh",
  {
    values: ValuesArraySchema,
  },
  async ({ values }) => {
    const results = values.map((value) => {
      if (Math.abs(value) >= 1) {
        throw new Error("Domain error: input value must be between -1 and 1");
      }
      return roundTrigResult(Decimal.atanh(new Decimal(value))).toString();
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }],
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
