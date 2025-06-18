# Use the official Bun base image
FROM oven/bun:1.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Expose any required ports (optional, as MCP uses stdio)
# But helpful for documentation purposes
# EXPOSE 3000

# Set environment variable to help with development
ENV NODE_ENV=production

# Command to run the server
CMD ["bun", "./src/index.ts"]
