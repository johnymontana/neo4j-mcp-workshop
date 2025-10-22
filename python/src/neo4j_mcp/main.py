from __future__ import annotations

import os
from functools import lru_cache
from typing import Any, Dict, List

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from mcp.server.models import InitializationOptions
from neo4j import GraphDatabase, Driver
import uvicorn


SERVER_NAME = "neo4j-mcp-ecommerce"


def _require_env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None or value == "":
        raise RuntimeError(f"Environment variable {name} is required")
    return value


@lru_cache(maxsize=1)
def get_neo4j_driver() -> Driver:
    load_dotenv()  # Load .env if present for local development
    uri = _require_env("NEO4J_URI")
    user = _require_env("NEO4J_USERNAME")
    password = _require_env("NEO4J_PASSWORD")
    return GraphDatabase.driver(uri, auth=(user, password))


def _run_cypher(query: str, parameters: Dict[str, Any] | None = None) -> List[Dict[str, Any]]:
    driver = get_neo4j_driver()
    db = os.getenv("NEO4J_DATABASE")
    with driver.session(database=db) if db else driver.session() as session:
        result = session.run(query, parameters or {})
        rows: List[Dict[str, Any]] = []
        for record in result:
            rows.append(record.data())
        return rows


mcp = FastMCP(SERVER_NAME)


@mcp.tool()
def search_customer(q: str) -> List[Dict[str, Any]]:
    """
    Search for customers by name or email substring (case-insensitive).

    Parameters:
      - q: search term to match against name or email
    Returns:
      List of customer maps with properties and internal id.
    """
    cypher = (
        """
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
        """
    )
    rows = _run_cypher(cypher, {"q": q})
    return [row["customer"] for row in rows]


@mcp.tool()
def recommend_product(customer_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Recommend products for a customer based on co-purchase behavior.

    Parameters:
      - customer_id: the customer id property value (e.g., domain id), not elementId
      - limit: max number of recommendations
    Returns:
      List of products with a score.
    """
    cypher = (
        """
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
        """
    )
    rows = _run_cypher(cypher, {"customer_id": customer_id, "limit": limit})
    return [row["recommendation"] for row in rows]


def run() -> None:
    """Run the MCP server with stdio transport."""
    print(f"Starting {SERVER_NAME} server on stdio")
    
    mcp.run(transport="streamable-http")


if __name__ == "__main__":
    run()
