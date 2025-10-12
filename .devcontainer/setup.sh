#!/bin/bash

set -e

echo "🚀 Setting up Neo4j MCP Server environment..."

wget -O neo4j-mcp.tar.gz https://github.com/neo4j/mcp/releases/download/v0.2.0/neo4j-mcp_Linux_x86_64.tar.gz
tar -xvzf neo4j-mcp.tar.gz


echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Neo4j Aura credentials"
echo "2. Run: ./start-mcp-server.sh"
