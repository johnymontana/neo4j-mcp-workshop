# Neo4j MCP Workshop

This repository demonstrates Model Context Protocol (MCP) server development with Neo4j graph databases. It includes both the official Neo4j MCP server for general-purpose Cypher querying and custom implementations for ecommerce applications.

## Outline

* **Module 1**: Using the `mcp-neo4j-cypher` MCP server with Claude Desktop for exploratory data analysis
* **Module 2**: Building your own MCP server and

## Module 1: Using the `mcp-neo4j-cypher` MCP server with Claude Desktop for exploratory data analysis

The [mcp-neo4j-cypher](https://github.com/neo4j-contrib/mcp-neo4j/tree/main/servers/mcp-neo4j-cypher) server is a Neo4j MCP implementation that provides comprehensive Cypher query capabilities for any Neo4j database.

### Features

- **`execute_cypher`** - Execute arbitrary Cypher queries against your Neo4j database
- **`explore_schema`** - Explore database schema (node labels, relationship types, property keys)
- **`get_database_info`** - Get information about your Neo4j database
- **Schema-agnostic** - Works with any Neo4j database structure
- **APOC Integration** - Leverages Neo4j APOC plugin for enhanced functionality

### Setup with Neo4j Aura and Claude Desktop

1. **Create Neo4j Aura Database**:
   - Sign up at [Neo4j Aura](https://console.neo4j.io/)
   - Create a new database instance
   - Note your connection URI, username, and password


2. **Configure Claude Desktop**:
   Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "neo4j-database": {
      "command": "uvx",
      "args": [ "mcp-neo4j-cypher@0.4.1", "--transport", "stdio"  ],
      "env": {
        "NEO4J_URI": "<YOUR_NEO4J_AURA_URI_HERE>",
        "NEO4J_USERNAME": "neo4j",
        "NEO4J_PASSWORD": "<YOUR_NEO4J_PASSWORD_HERE>",
        "NEO4J_DATABASE": "neo4j"
      }
    }
  }
}
```

3. **Test the Integration**:
   - Restart Claude Desktop
   - Ask Claude to explore your Neo4j database: "What does my Neo4j database contain?"
   - Try queries like: "Find all nodes in my database" or "Show me the schema of my Neo4j database"

## Module 2: Building Your Own MCP Server

## Creating Custom MCP Servers

This section covers how to build your own MCP servers using different SDKs and frameworks. The examples demonstrate domain-specific implementations for ecommerce applications.

### MCP Server Development SDKs

#### Python SDKs

**FastMCP** (Used in this project)
- **Package**: `fastmcp`
- **Features**: High-level Python framework for MCP server development
- **Best for**: Rapid prototyping and Python developers
- **Installation**: `pip install fastmcp`

**Official Python MCP SDK**
- **Package**: `mcp`
- **Features**: Official Python implementation of MCP protocol
- **Best for**: Full control over MCP protocol implementation
- **Installation**: `pip install mcp`

#### TypeScript SDKs

**Official TypeScript MCP SDK** (Used in this project)
- **Package**: `@modelcontextprotocol/sdk`
- **Features**: Official TypeScript implementation with full type safety
- **Best for**: TypeScript/JavaScript developers and production applications
- **Installation**: `npm install @modelcontextprotocol/sdk`

### Development Workflow

1. **Choose Your SDK**: Select based on your language preference and requirements
2. **Define Tools**: Design MCP tools that expose your application's functionality
3. **Implement Handlers**: Write tool handlers that perform the actual work
4. **Test with MCP Inspector**: Use `npx @modelcontextprotocol/inspector` for development
5. **Integrate with AI Clients**: Connect to Claude Desktop or other MCP clients

## Ecommerce MCP Server Implementation

This project includes a custom MCP server implementation designed specifically for ecommerce applications. It demonstrates how to build domain-specific MCP servers with targeted tools for business use cases.

### Features

The ecommerce MCP server provides two specialized tools:

1. **`search_customer`** - Search for customers by name or email (case-insensitive)
2. **`recommend_product`** - Recommend products for a customer based on co-purchase behavior

### Available Implementations

#### Python Implementation (`python/`)
- **Framework**: FastMCP
- **Package Manager**: uv
- **Setup**:
  ```bash
  cd python
  uv sync
  cp env.example .env
  # Edit .env with your Neo4j credentials
  uv run neo4j-mcp-ecommerce
  ```

#### TypeScript Implementation (`ts/`)
- **Framework**: Official TypeScript MCP SDK
- **Package Manager**: npm/yarn
- **Setup**:
  ```bash
  cd ts
  npm install
  cp env.example .env
  # Edit .env with your Neo4j credentials
  npm run dev
  ```

### Database Schema

The ecommerce servers assume a Neo4j schema with the following structure:

```
(:Customer {id, name, email})
(:Product {id, title})
(:Order)
(:LineItem)

(:Customer)-[:PURCHASED]->(:Order)
(:Order)-[:CONTAINS]->(:LineItem)
(:LineItem)-[:PRODUCT]->(:Product)
```

### Environment Configuration

Both implementations require the same environment variables:

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j  # optional
```

### Testing with MCP Inspector

Test either implementation using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector
```



## Prerequisites

- **Neo4j Database**: A running Neo4j instance (local, cloud, or Neo4j Aura)
- **APOC Plugin**: Required for mcp-neo4j-cypher (included in Neo4j Aura)
- **Python**: 3.10+ (for Python implementations)
- **Node.js**: 18.0+ (for TypeScript implementation)
- **Package Manager**: uv (Python) or npm/yarn (TypeScript)

## Project Structure

```text
neo4j-mcp-workshop/
├── python/                 # Python ecommerce implementation
│   ├── src/neo4j_mcp/
│   │   └── main.py         # MCP server implementation
│   ├── pyproject.toml      # uv project configuration
│   ├── env.example         # Environment variables template
│   └── README.md          # Python-specific documentation
├── ts/                     # TypeScript ecommerce implementation
│   ├── src/
│   │   └── index.ts       # MCP server implementation
│   ├── package.json        # npm project configuration
│   ├── tsconfig.json       # TypeScript configuration
│   ├── env.example         # Environment variables template
│   └── README.md          # TypeScript-specific documentation
└── README.md              # This file
```

## Learning Objectives

This workshop demonstrates:

- **Using Neo4j MCP Servers**: Using existing Neo4j MCP servers
- **Custom MCP Development**: Building domain-specific MCP servers
- **SDK Comparison**: Working with different MCP development frameworks
- **Graph Database Integration**: Connecting MCP servers to Neo4j
- **AI Integration**: Connecting MCP servers to Claude Desktop
- **Testing and Debugging**: Using MCP Inspector for development



## Additional Resources

- **[mcp-neo4j-cypher Repository](https://github.com/neo4j-contrib/mcp-neo4j/tree/main/servers/mcp-neo4j-cypher)** - Neo4j MCP server documentation
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - MCP specification and documentation
- **[Neo4j Documentation](https://neo4j.com/docs/)** - Neo4j database documentation
- **[Neo4j Aura](https://console.neo4j.io/)** - Cloud-hosted Neo4j database service
- **[APOC Plugin](https://neo4j.com/labs/apoc/)** - Neo4j APOC plugin for additional procedures
- **[FastMCP Documentation](https://github.com/jlowin/fastmcp)** - FastMCP Python framework
- **[TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)** - Official TypeScript MCP SDK