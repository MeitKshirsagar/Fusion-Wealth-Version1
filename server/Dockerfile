FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose port for SSE transport
EXPOSE 3002

# Default command to run MCP server
# Can be overridden by passing --mcp flag if needed, but the script 'mcp' does that.
CMD ["npm", "run", "mcp"]
