# Neo4j MCP Ecommerce Server (Python)

An MCP server that exposes two tools backed by Neo4j:

- `search_customer(q: str)` — search customers by name or email
- `recommend_product(customer_id: str, limit: int = 5)` — recommend products via co-purchase

This project uses `uv` for dependency and runtime management and the official Python MCP SDK.

## Prerequisites

- Python 3.10+
- `uv` installed (see docs: https://docs.astral.sh/uv/)
- A running Neo4j database

## Setup

```bash
cd python
# (optional) create and activate a project venv
uv venv && source .venv/bin/activate

# install dependencies
uv sync

# configure environment
cp env.example .env
# edit .env with your credentials
```

Required environment variables:

- `NEO4J_URI` (e.g. `bolt://localhost:7687`)
- `NEO4J_USERNAME`
- `NEO4J_PASSWORD`
- `NEO4J_DATABASE` (optional; defaults to Neo4j driver default)

## Run the MCP server

- Via uv script (recommended during development):

```bash
uv run neo4j-mcp-ecommerce
```

- As an MCP command in compatible clients (stdio):

Configure your client to launch the server command in this directory, for example:

```bash
uv run neo4j-mcp-ecommerce
```

The server communicates over stdio; no network port is opened.

## Testing with MCP Inspector

You can test the server using the MCP Inspector, a web-based tool for debugging MCP servers:

1. Run the MCP Inspector:
```bash
npx @modelcontextprotocol/inspector
```

2. In the inspector interface:
   - Click "Add Server"
   - Choose "Command" as the transport
   - Set the command to: `uv run neo4j-mcp-ecommerce`
   - Set the working directory to: `/path/to/your/python/directory`
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

## Notes
- Credentials are read from environment variables (dotenv is supported for local dev).
- Cypher assumes labels/properties: `:Customer {id, name, email}` and `:Product {id, title}` with relationships approximating PURCHASED/CONTAINS/PRODUCT. Adjust queries to match your schema if different.
