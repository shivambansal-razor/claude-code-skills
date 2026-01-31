# Querybook MCP Setup Guide

This guide will help you connect Querybook to Claude Code.

## Prerequisites

- Node.js installed
- Access to your Querybook instance at https://querybook.de.razorpay.com

## Getting Your Querybook API Token

### Method 1: Browser Developer Tools (Recommended)

1. Open your Querybook instance in a browser: https://querybook.de.razorpay.com/prod/
2. Log in to your account
3. Open Developer Tools (F12 or Right-click → Inspect)
4. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
5. Under **Cookies**, find `https://querybook.de.razorpay.com`
6. Look for a cookie named `token`, `auth_token`, `session`, or similar
7. Copy the cookie value - this is your API token

### Method 2: Network Tab

1. Open your Querybook instance: https://querybook.de.razorpay.com/prod/
2. Open Developer Tools (F12)
3. Go to the **Network** tab
4. Refresh the page or make any query
5. Look at the request headers for API calls
6. Find the `Authorization` header - it will look like `Bearer YOUR_TOKEN_HERE`
7. Copy everything after `Bearer ` - that's your token

### Method 3: Querybook Settings (if available)

1. Log in to Querybook
2. Go to your profile settings or API settings
3. Look for "API Token" or "Personal Access Token"
4. Generate a new token if needed
5. Copy the token value

## Installing the Token

Once you have your token:

1. Open the Claude Desktop config file:
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

2. Find the `querybook` section and replace `YOUR_TOKEN_HERE` with your actual token:
   ```json
   "querybook": {
     "command": "node",
     "args": [
       "/Users/shivam.bansal/Documents/claude-code/querybook-mcp-server.js"
     ],
     "env": {
       "QUERYBOOK_URL": "https://querybook.de.razorpay.com",
       "QUERYBOOK_TOKEN": "your_actual_token_here"
     }
   }
   ```

3. **Important**: Restart Claude Desktop completely for the changes to take effect:
   - Quit Claude Desktop (Cmd+Q)
   - Reopen Claude Desktop

## Verifying the Setup

After restarting Claude Desktop, you can test the connection by asking Claude to:

- List available data sources: "Show me all available Querybook data sources"
- Execute a simple query: "Run this query in Querybook: SELECT 1"
- Search for queries: "Search for queries about payments in Querybook"

## Available Features

Once connected, you can:

1. **Execute SQL queries**: Run queries against your databases
2. **List data sources**: See all available database engines
3. **Search queries**: Find saved queries by keyword
4. **Get query details**: View specific saved queries
5. **Get table schemas**: View table structures and column information
6. **Check execution status**: Monitor long-running queries

## Troubleshooting

### Token Not Working

If you get authentication errors:
- Try Method 1 again to get a fresh token
- Make sure you copied the entire token without extra spaces
- Check if your Querybook session has expired and re-login

### Connection Errors

If Claude can't connect to Querybook:
- Verify the URL is correct: `https://querybook.de.razorpay.com`
- Check if you're on the Razorpay VPN (if required)
- Make sure you've restarted Claude Desktop after adding the token

### Server Not Loading

If the Querybook server doesn't show up:
- Check the config file syntax is valid JSON
- Make sure the server file path is correct
- Look at Claude Desktop logs for errors

## Example Usage

Once set up, you can ask Claude:

```
"Can you show me all the database engines available in Querybook?"

"Run this query in Querybook engine 5:
SELECT * FROM payments LIMIT 10"

"Search for queries about cross-border payments in Querybook"

"Get the schema for the payments.transactions table"
```

## Security Note

Your API token is stored in plaintext in the config file. Keep your system secure and don't share this file with others.
