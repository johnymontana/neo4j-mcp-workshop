# Neo4j MCP Ecommerce Server (TypeScript)

An MCP server that exposes two tools backed by Neo4j:

- `search_customer(q: string)` — search customers by name or email
- `recommend_product(customer_id: string, limit?: number)` — recommend products via co-purchase

This project uses npm/yarn for dependency management and the official TypeScript MCP SDK.

## Prerequisites

- Node.js 18.0+
- npm or yarn
- A running Neo4j database

## Setup

```bash
cd ts
# install dependencies
npm install

# configure environment
cp env.example .env
# edit .env with your credentials
```

Required environment variables:

- `NEO4J_URI` (e.g. `bolt://localhost:7687`)
- `NEO4J_USERNAME`
- `NEO4J_PASSWORD`
- `NEO4J_DATABASE` (optional; defaults to Neo4j driver default)

## Development

Run the server in development mode (with hot reload):

```bash
npm run dev
```

## Production

Build and run the server:

```bash
npm run build
npm start
```

## Testing with MCP Inspector

You can test the server using the MCP Inspector, a web-based tool for debugging MCP servers:

1. Run the MCP Inspector:
```bash
npx @modelcontextprotocol/inspector
```

2. In the inspector interface:
   - Click "Add Server"
   - Choose "Command" as the transport
   - Set the command to: `npm run dev` (for development) or `npm start` (for production)
   - Set the working directory to: `/path/to/your/ts/directory`
   - Click "Connect"

3. Once connected, you can:
   - View available tools (`search_customer` and `recommend_product`)
   - Test tool calls with sample parameters
   - Inspect responses and debug any issues

The inspector provides a convenient way to test your MCP server without needing a full MCP client setup.

## Tools

### search_customer
- **Input**: `q` — substring to match name or email (case-insensitive)
- **Output**: list of customer maps: `{ id, nodeId, name, email }`

### recommend_product
- **Input**: `customer_id` — your domain identifier on `:Customer {id: ...}`
- **Input**: `limit` — max recommendations (default 5)
- **Output**: list of `{ productId, title, score }`

## Project Structure

```
ts/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (after build)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── env.example           # Environment variables template
└── README.md            # This file
```

## Scripts

- `npm run dev` — Run server in development mode with tsx
- `npm run build` — Compile TypeScript to JavaScript
- `npm start` — Run compiled server
- `npm run clean` — Remove compiled files

## Notes

- Credentials are read from environment variables (dotenv is supported for local dev).
- Cypher assumes labels/properties: `:Customer {id, name, email}` and `:Product {id, title}` with relationships approximating PURCHASED/CONTAINS/PRODUCT. Adjust queries to match your schema if different.
- The server uses ES modules and requires Node.js 18+.
- TypeScript types are included for better development experience.
