#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Querybook configuration from environment variables
const QUERYBOOK_URL = process.env.QUERYBOOK_URL || "https://querybook.de.razorpay.com";
const QUERYBOOK_TOKEN = process.env.QUERYBOOK_TOKEN;

if (!QUERYBOOK_TOKEN) {
  throw new Error("QUERYBOOK_TOKEN environment variable is required");
}

const server = new Server(
  {
    name: "querybook-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Querybook API helper function
async function querybookAPICall(endpoint, method = "GET", body = null) {
  const url = `${QUERYBOOK_URL}/${endpoint}`;
  const headers = {
    Authorization: `Bearer ${QUERYBOOK_TOKEN}`,
    "Content-Type": "application/json",
  };

  const options = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Querybook API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "execute_query",
        description: "Execute a SQL query in Querybook and get results",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The SQL query to execute",
            },
            engine_id: {
              type: "number",
              description: "The database engine ID to run the query on",
            },
            limit: {
              type: "number",
              description: "Maximum number of rows to return (default: 1000)",
            },
          },
          required: ["query", "engine_id"],
        },
      },
      {
        name: "list_data_sources",
        description: "List all available data sources/engines in Querybook",
        inputSchema: {
          type: "object",
          properties: {
            environment_id: {
              type: "number",
              description: "Filter by environment ID (optional)",
            },
          },
        },
      },
      {
        name: "search_queries",
        description: "Search for saved queries in Querybook",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search term to find in query titles and content",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return (default: 20)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_query",
        description: "Get details of a specific saved query by ID",
        inputSchema: {
          type: "object",
          properties: {
            query_id: {
              type: "number",
              description: "The ID of the query to retrieve",
            },
          },
          required: ["query_id"],
        },
      },
      {
        name: "get_table_schema",
        description: "Get schema information for a specific table",
        inputSchema: {
          type: "object",
          properties: {
            table_name: {
              type: "string",
              description: "Name of the table (can include schema prefix like 'schema.table')",
            },
            schema_name: {
              type: "string",
              description: "Schema name (optional if included in table_name)",
            },
          },
          required: ["table_name"],
        },
      },
      {
        name: "get_query_execution_status",
        description: "Check the status of a running query execution",
        inputSchema: {
          type: "object",
          properties: {
            execution_id: {
              type: "number",
              description: "The execution ID to check status for",
            },
          },
          required: ["execution_id"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "execute_query": {
        const { query, engine_id, limit = 1000 } = args;

        // Start query execution
        const execution = await querybookAPICall("query_execution/", "POST", {
          query,
          engine_id,
        });

        // Poll for results
        let status = "running";
        let result = null;
        const maxAttempts = 60; // 60 seconds max
        let attempts = 0;

        while (status === "running" && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          result = await querybookAPICall(`query_execution/${execution.id}/`);
          status = result.status;
          attempts++;
        }

        if (status !== "done") {
          throw new Error(`Query execution status: ${status}`);
        }

        // Get query results
        const resultsData = await querybookAPICall(
          `query_execution/${execution.id}/result/`
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  execution_id: execution.id,
                  status: status,
                  columns: resultsData.columns || [],
                  rows: resultsData.data?.slice(0, limit) || [],
                  total_rows: resultsData.data?.length || 0,
                  execution_time: result.duration,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_data_sources": {
        const { environment_id } = args;
        let endpoint = "query_engine/";
        if (environment_id) {
          endpoint += `?environment_id=${environment_id}`;
        }

        const engines = await querybookAPICall(endpoint);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  engines: engines.map((engine) => ({
                    id: engine.id,
                    name: engine.name,
                    language: engine.language,
                    description: engine.description,
                    environment_id: engine.environment_id,
                  })),
                  total: engines.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "search_queries": {
        const { query, limit = 20 } = args;
        const results = await querybookAPICall(
          `search/?keywords=${encodeURIComponent(query)}&limit=${limit}&searchType=DataDoc`
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  results: results.results?.map((item) => ({
                    id: item.id,
                    title: item.title,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    owner: item.owner_uid,
                  })) || [],
                  total: results.count || 0,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_query": {
        const { query_id } = args;
        const queryData = await querybookAPICall(`datadoc/${query_id}/`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  id: queryData.id,
                  title: queryData.title,
                  cells: queryData.cells?.map((cell) => ({
                    id: cell.id,
                    type: cell.cell_type,
                    content: cell.context,
                    meta: cell.meta,
                  })) || [],
                  created_at: queryData.created_at,
                  updated_at: queryData.updated_at,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_table_schema": {
        const { table_name, schema_name } = args;
        const fullTableName = schema_name
          ? `${schema_name}.${table_name}`
          : table_name;

        const tableInfo = await querybookAPICall(
          `table/${encodeURIComponent(fullTableName)}/`
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  name: tableInfo.name,
                  schema: tableInfo.schema,
                  columns: tableInfo.columns?.map((col) => ({
                    name: col.name,
                    type: col.type,
                    comment: col.comment,
                  })) || [],
                  description: tableInfo.description,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_query_execution_status": {
        const { execution_id } = args;
        const execution = await querybookAPICall(`query_execution/${execution_id}/`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  id: execution.id,
                  status: execution.status,
                  duration: execution.duration,
                  created_at: execution.created_at,
                  completed_at: execution.completed_at,
                  error: execution.error || null,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Server running - no console output needed for MCP stdio
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
