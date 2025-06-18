# Calculator MCP Server

A TypeScript-based MCP server that implements a robust calculator with precise decimal arithmetic. This server demonstrates core MCP concepts by providing arithmetic operations with support for multiple operands and configurable precision using Decimal.js.

## Features

### Tools

- `add` - Adds an array of numbers
  - Takes `numbers` parameter as array of numbers to add
  - Returns sum with configured precision
- `subtract` - Subtracts an array of numbers sequentially
  - Takes `numbers` parameter as array of numbers to subtract
  - Requires at least one number
  - Returns result of subtracting each subsequent number from the first
- `multiply` - Multiplies an array of numbers
  - Takes `numbers` parameter as array of numbers to multiply
  - Returns product with configured precision
- `divide` - Divides numbers sequentially
  - Takes `numbers` parameter as array of numbers to divide
  - Requires at least two numbers
  - Returns result of dividing first number by all subsequent numbers
  - Handles division by zero gracefully
- `set_precision` - Configures decimal precision
  - Takes `precision` parameter as number of decimal places to use
  - Affects precision of all subsequent calculations

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
