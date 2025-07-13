# Japan Transfer MCP Server

**English** | **[日本語](README_JP.md)**

[![npm version](https://badge.fury.io/js/japan-transfer-mcp.svg)](https://www.npmjs.com/package/japan-transfer-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Model Context Protocol (MCP) server for Japanese transportation route planning integration with AI assistants.

## ⚠️ Important Notice

**Data Source**: This server retrieves transportation data from **Jorudan Transit Guide** ([www.jorudan.co.jp](https://www.jorudan.co.jp/)).

**Usage Restrictions**: When using this MCP server, you must comply with [Jorudan's Terms of Service](https://www.jorudan.co.jp/terms/). In particular, please note Article 6: *"Acts that place excessive load on the network or system of this service (including acts of attempting to acquire large amounts of information in a short time using automated processing tools, etc., but this does not prevent the use of automated processing tools themselves)"*. Please ensure reasonable usage that does not place excessive load on Jorudan's servers.

## Overview

Japan Transfer MCP Server is a Model Context Protocol server that integrates Japanese transportation route planning services with AI assistants like Claude Desktop. It enables AI assistants to search for train stations, bus stops, and plan optimal routes across Japan's extensive transportation network.

## Key Features

- **Station Search**: Search for railway stations, bus stops, and transportation facilities by name
- **Route Planning**: Find optimal routes between any two locations in Japan
- **Multi-modal Transportation**: Support for trains, buses, subways, and other transportation modes
- **Smart Formatting**: Natural language response formatting with emojis and structured information
- **Token Optimization**: Response size control with token limits for efficient API usage
- **Comprehensive Data**: Real-time transportation data including schedules, fares, and transfer information

## Target Users

### For General Users
Perfect for those who want to use Japanese transportation planning features with Claude Desktop. AI assistants can help with:

- Finding train stations and bus stops across Japan
- Planning optimal routes for travel
- Getting real-time transportation information
- Understanding complex Japanese transportation systems

### For AI Assistant Users
This server enables AI assistants to:

- Search for transportation facilities by name
- Plan routes between locations with detailed information

## Technical Specifications

### Available Tools

#### 1. `search_station_by_name`
**Description**: Search for stations and transportation facilities by name

**Parameters**:
- `query` (required, string): The name of the station to search for (must be in Japanese)
- `maxTokens` (optional, number): The maximum number of tokens to return
- `onlyName` (optional, boolean): Whether to only return the name of the station. If you do not need detailed information, it is generally recommended to set this to true.

**Returns**: List of matching stations with detailed information including location, reading, and administrative codes.

#### 2. `search_route_by_name`
**Description**: Search for optimal routes between two locations by station names

**Parameters**:
- `from` (required, string): Departure station name (in Japanese)
- `to` (required, string): Arrival station name (in Japanese)
- `datetime` (optional, string): Date and time in ISO-8601 format (YYYY-MM-DD HH:MM:SS). If not provided, the current time in Japan will be used.
- `datetime_type` (required, string): Time specification type:
  - `departure`: Search routes by departure time
  - `arrival`: Search routes by arrival time
  - `first`: Search first train routes
  - `last`: Search last train routes
- `maxTokens` (optional, number): Maximum number of tokens in response

**Returns**: Detailed route information including schedules, fares, transfers, and travel times.



## Setup

### Claude Desktop Configuration

Add the following configuration to your `claude_desktop_config.json` file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### Basic Configuration

```json
{
  "mcpServers": {
    "japan-transfer-mcp": {
      "command": "npx",
      "args": ["japan-transfer-mcp"]
    }
  }
}
```

### Online Testing

You can test the MCP server functionality online without local setup:

- **SSE Format**: https://japan-transfer-mcp-server.ushida-yosei.workers.dev/sse
- **Streamable HTTP Format**: https://japan-transfer-mcp-server.ushida-yosei.workers.dev/mcp

Try these endpoints at [@https://playground.ai.cloudflare.com/](https://playground.ai.cloudflare.com/) to test the server functionality before setting up locally.

## Usage Examples

### Station Search
```
Search for "Tokyo Station" → Returns detailed information about Tokyo Station including coordinates, reading, and administrative codes.
```

### Route Planning
```
Plan a route from Tokyo Station to Osaka Station departing at 9:00 AM tomorrow → Returns multiple route options with schedules, fares, and transfer information.
```

## Troubleshooting

### Common Issues

#### 1. Station Not Found
**Symptoms**: `search_station_by_name` returns empty results
**Solutions**:
- Verify the station name is in Japanese
- Try alternative spellings or readings
- Use partial names for broader search results

#### 2. Route Search Fails
**Symptoms**: `search_route_by_name` returns errors
**Solutions**:
- Verify both departure and arrival stations exist
- Check date/time format (YYYY-MM-DDTHH:MM)
- Ensure datetime_type is one of the valid options

#### 3. Token Limit Exceeded
**Symptoms**: Responses are truncated
**Solutions**:
- Reduce maxTokens parameter
- Use onlyName=true for station searches when detailed info isn't needed
- Break complex queries into smaller parts

#### 4. Server Fails to Start
**Symptoms**: MCP server initialization fails
**Solutions**:
- Verify Node.js version compatibility
- Check network connectivity
- Ensure proper Claude Desktop configuration

## Response Format

The server returns richly formatted responses with:
- 🚃 Transportation mode icons
- 📅 Date and time information
- 💰 Fare details
- ⏱️ Duration and schedule information
- 🔄 Transfer information
- 🌱 Environmental impact data
- ⚠️ Service notices and alerts

## Limitations

- Supports Japanese transportation networks only
- Requires Japanese language input for station names
- Some remote or local transportation services may not be covered

## Using as a Library

This MCP server can also be used as a library in other Node.js projects. When imported as a module, it will not automatically connect to stdio transport, allowing you to use the server programmatically.

### Installation

```bash
npm install japan-transfer-mcp
```

### Usage

```javascript
import server from 'japan-transfer-mcp';

// Use the server instance programmatically
// The server will not auto-connect when imported as a library
// You can access the server's tools and handlers directly
```

## Dependencies

Main dependencies:
- `@modelcontextprotocol/sdk`: MCP server development kit
- `axios`: HTTP client for API requests
- `cheerio`: HTML parsing for web scraping
- `gpt-tokenizer`: Token counting for response optimization
- `zod`: Schema validation

## License

MIT License

## Contributing

Pull requests and issue reports are welcome. Please ensure:
1. Code follows TypeScript best practices
2. Tests pass for any new functionality
3. Documentation is updated accordingly

## Support

If you encounter issues, please check:
1. Claude Desktop configuration
2. Network connectivity
3. Input format validation
4. Token limits and response sizes

For additional support, please create an issue on the GitHub repository.

## Acknowledgments

This project integrates with Japanese transportation data providers to offer comprehensive route planning capabilities. Special thanks to the transportation operators who provide public data access.
