#!/bin/bash

set -e

echo "🚀 Setting up Neo4j MCP Server environment..."

npx --yes @johnymontana/neo4j-mcp --download-only



echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Neo4j Aura credentials"
echo "2. Run: ./start-mcp-server.sh"
