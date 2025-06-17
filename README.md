# Calculator MCP Server

A simple calculator MCP server that provides basic arithmetic tools.

This is a TypeScript-based MCP server that implements a simple calculator. It demonstrates core MCP concepts by providing:

- Tools for performing arithmetic operations

## Features

### Tools

- `add` - Adds two numbers
  - Takes `a` and `b` as required number parameters
- `subtract` - Subtracts two numbers
  - Takes `a` and `b` as required number parameters
- `multiply` - Multiplies two numbers
  - Takes `a` and `b` as required number parameters
- `divide` - Divides two numbers
  - Takes `a` (numerator) and `b` (denominator) as required number parameters

## Development

Install dependencies:

```bash
bun install
```

For development with auto-rebuild:

```bash
bun run watch
```

## Installation

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

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
bun run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
