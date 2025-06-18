# Calculator MCP Server

A TypeScript-based MCP server that implements a robust calculator with precise decimal arithmetic. This server demonstrates core MCP concepts by providing arithmetic operations with support for multiple operands and configurable precision using Decimal.js.

## Features

### Tools

#### Arithmetic Functions

These functions take an array of at least two numbers and return a single numerical result.

- `add` - Adds an array of numbers.
- `subtract` - Subtracts numbers sequentially from the first.
- `multiply` - Multiplies an array of numbers.
- `divide` - Divides numbers sequentially. Handles division by zero.

#### Trigonometric Functions

These functions operate on arrays of numbers and return an array of results.

- **Basic Trigonometry**: `sin`, `cos`, `tan`
  - Input: `angles` (array of numbers), `mode` ('radians' or 'degrees').
- **Inverse Trigonometry**: `asin`, `acos`, `atan`
  - Input: `values` (array of numbers).
- **Hyperbolic Functions**: `sinh`, `cosh`, `tanh`
  - Input: `values` (array of numbers).
- **Inverse Hyperbolic Functions**: `asinh`, `acosh`, `atanh`
  - Input: `values` (array of numbers).

#### Miscellaneous

- `set_precision` - Configures decimal precision for all subsequent calculations.
  - Takes `precision` parameter as the number of decimal places.

## Development

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun start
```

## Installation as standalone MCP server

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "Calculator": {
      "command": "/path/to/calculator-mcp/src/index.ts"
    }
  }
}
```

Or for Cline VSCode extension, add a modified version of this to your MCP config file:

```json
   "Calculator": {
      "autoApprove": [
        "add",
        "subtract",
        "multiply",
        "divide",
        "set_precision"
      ],
      "disabled": true,
      "timeout": 60,
      "type": "stdio",
      "command": "bun",
      "args": [
        "/path-to-your/calculator-mcp/src/index.ts"
      ]
    }
```

## Installation using Docker

To run the MCP server using Docker, you should first build the image using:

```bash
docker build -t calculator-mcp .
```

Followed by adding this to the (Cline) MCP config file:

```json
    "Calculator (docker)": {
      "autoApprove": [
        "add",
        "subtract",
        "multiply",
        "divide",
        "set_precision"
      ],
      "disabled": false,
      "timeout": 60,
      "type": "stdio",
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "calculator-mcp"
      ]
    }
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
bun run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
