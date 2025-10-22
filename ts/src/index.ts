import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { driver, Driver, Session } from 'neo4j-driver';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SERVER_NAME = 'neo4j-mcp-ecommerce';

interface Customer {
  id: number;
  nodeId: string;
  name: string;
  email: string;
}

interface ProductRecommendation {
  productId: string;
  title: string;
  score: number;
}

class Neo4jMCPServer {
  private server: Server;
  private neo4jDriver: Driver | null = null;

  constructor() {
    this.server = new Server(
      {
        name: SERVER_NAME,
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Environment variable ${name} is required`);
    }
    return value;
  }

  private getNeo4jDriver(): Driver {
    if (!this.neo4jDriver) {
      const uri = this.requireEnv('NEO4J_URI');
      const username = this.requireEnv('NEO4J_USERNAME');
      const password = this.requireEnv('NEO4J_PASSWORD');
      
      this.neo4jDriver = driver(uri, {
        username,
        password,
      });
    }
    return this.neo4jDriver;
  }

  private async runCypher<T = any>(
    query: string,
    parameters: Record<string, any> = {}
  ): Promise<T[]> {
    const driver = this.getNeo4jDriver();
    const database = process.env.NEO4J_DATABASE;
    
    const session: Session = database 
      ? driver.session({ database })
      : driver.session();

    try {
      const result = await session.run(query, parameters);
      return result.records.map(record => record.toObject());
    } finally {
      await session.close();
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_customer',
            description: 'Search for customers by name or email substring (case-insensitive)',
            inputSchema: {
              type: 'object',
              properties: {
                q: {
                  type: 'string',
                  description: 'Search term to match against name or email',
                },
              },
              required: ['q'],
            },
          },
          {
            name: 'recommend_product',
            description: 'Recommend products for a customer based on co-purchase behavior',
            inputSchema: {
              type: 'object',
              properties: {
                customer_id: {
                  type: 'string',
                  description: 'The customer id property value (e.g., domain id), not elementId',
                },
                limit: {
                  type: 'number',
                  description: 'Max number of recommendations',
                  default: 5,
                },
              },
              required: ['customer_id'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_customer': {
            const { q } = args as { q: string };
            const cypher = `
              MATCH (c:Customer)
              WHERE toLower(c.name) CONTAINS toLower($q)
                 OR toLower(c.email) CONTAINS toLower($q)
              RETURN {
                id: id(c),
                nodeId: elementId(c),
                name: c.name,
                email: c.email
              } AS customer
              LIMIT 25
            `;
            
            const rows = await this.runCypher(cypher, { q });
            const customers: Customer[] = rows.map(row => row.customer);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(customers, null, 2),
                },
              ],
            };
          }

          case 'recommend_product': {
            const { customer_id, limit = 5 } = args as { 
              customer_id: string; 
              limit?: number; 
            };
            
            const cypher = `
              MATCH (c:Customer {id: $customer_id})-[:PURCHASED]->(:Order)-[:CONTAINS]->(:LineItem)-[:PRODUCT]->(p:Product)
              WITH DISTINCT c, p
              MATCH (p)<-[:PRODUCT]-(:LineItem)<-[:CONTAINS]-(:Order)<-[:PURCHASED]-(other:Customer)
              WHERE other <> c
              MATCH (other)-[:PURCHASED]->(:Order)-[:CONTAINS]->(:LineItem)-[:PRODUCT]->(rec:Product)
              WHERE NOT (c)-[:PURCHASED]->(:Order)-[:CONTAINS]->(:LineItem)-[:PRODUCT]->(rec)
              RETURN {
                productId: rec.id,
                title: rec.title,
                score: count(*)
              } AS recommendation
              ORDER BY recommendation.score DESC
              LIMIT $limit
            `;
            
            const rows = await this.runCypher(cypher, { 
              customer_id, 
              limit 
            });
            const recommendations: ProductRecommendation[] = rows.map(row => row.recommendation);
            
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(recommendations, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`${SERVER_NAME} server running on stdio`);
  }

  async close(): Promise<void> {
    if (this.neo4jDriver) {
      await this.neo4jDriver.close();
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down server...');
  process.exit(0);
});

// Start the server
const server = new Neo4jMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
