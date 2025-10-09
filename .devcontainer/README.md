# Neo4j MCP Server Codespace

This repository is configured to run the Neo4j MCP (Model Context Protocol) server in a GitHub Codespace.

## Quick Start

1. **Open in Codespace**: Click the "Code" button and create a new Codespace
2. **Configure Credentials**: Edit the `.env` file with your Neo4j Aura credentials
3. **Start Server**: Run `./start-mcp-server.sh`

## Configuration

### Neo4j Aura Credentials

Update the `.env` file with your connection details:

```env
NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
NEO4J_DATABASE=neo4j
```

### Finding Your Credentials

1. Log into [Neo4j Aura Console](https://console.neo4j.io/)
2. Select your database instance
3. Click "Connect" to view connection details
4. Copy the URI, username, and password

## What Happens Automatically

When the Codespace starts:

1. Downloads the latest Neo4j MCP server release
2. Installs dependencies
3. Creates a template `.env` file
4. Sets up the start script

## Manual Setup (if needed)

If automatic setup fails:

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start server
npm start
```

## Troubleshooting

**Connection Issues:**
- Verify your Neo4j Aura instance is running
- Check that IP allowlist includes Codespace IPs (or set to 0.0.0.0/0)
- Confirm credentials are correct

**Server Won't Start:**
- Check `.env` file exists and is properly formatted
- Verify Node.js version (should be v20)
- Review logs for specific error messages

## Security Notes

- **Never commit `.env`** - It's included in `.gitignore`
- Use environment secrets for production deployments
- Rotate credentials regularly
