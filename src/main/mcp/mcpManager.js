import fs from 'fs'
import path from 'path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

class MCPManager {
  constructor() {
    this.clients = new Map() // serverName -> { client, transport, tools }
    this.toolToClientMap = new Map() // toolName -> client
    this.initialized = false
  }

  /**
   * Initializes all standalone MCP servers configured in mcp_config.json
   */
  async initialize() {
    if (this.initialized) return

    const configPath = path.join(process.cwd(), 'mcp_config.json')
    let config = { mcpServers: {} }

    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, 'utf8')
        config = JSON.parse(raw)
      } catch (err) {
        console.warn('[MCPManager] Failed to parse mcp_config.json:', err)
      }
    }

    const servers = config.mcpServers || {}

    console.log(`[MCP CLIENT] Connecting to configured MCP Servers in mcp_config.json...`)
    for (const [serverName, serverConfig] of Object.entries(servers)) {
      try {
        await this.connectServer(serverName, serverConfig)
      } catch (err) {
        console.warn(`[MCP CLIENT WARN] Could not connect to MCP server "${serverName}":`, err.message)
      }
    }

    this.initialized = true
    console.log(`[MCP CLIENT SUCCESS] Connected to ${this.clients.size} MCP servers with ${this.toolToClientMap.size} registered tools.\n`)
  }

  /**
   * Connects to a single MCP server process via stdio transport
   */
  async connectServer(name, config) {
    const command = config.command || 'node'
    const args = config.args || []
    const env = { ...process.env, ...(config.env || {}) }

    const transport = new StdioClientTransport({
      command,
      args,
      env
    })

    const client = new Client(
      {
        name: `ev-client-${name}`,
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    )

    await client.connect(transport)

    const response = await client.listTools()
    const tools = response.tools || []

    for (const tool of tools) {
      this.toolToClientMap.set(tool.name, client)
    }

    this.clients.set(name, { client, transport, tools })
    console.log(` -> Connected MCP Server "${name}" via stdio (${tools.length} tools registered)`)
  }

  /**
   * Returns tool definitions formatted for OpenAI / NVIDIA Nemotron Function Calling format
   */
  getToolDefinitions() {
    const definitions = []

    for (const [_, entry] of this.clients.entries()) {
      for (const tool of entry.tools) {
        definitions.push({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description || '',
            parameters: tool.inputSchema || { type: 'object', properties: {} }
          }
        })
      }
    }

    return definitions
  }

  /**
   * Executes a tool via the responsible standalone MCP server client
   */
  async callTool(toolName, args = {}) {
    if (!this.initialized) {
      await this.initialize()
    }

    const client = this.toolToClientMap.get(toolName)
    if (!client) {
      throw new Error(`No MCP Server registered for tool "${toolName}"`)
    }

    console.log(`[MCP CLIENT] Sending stdio JSON-RPC request for tool "${toolName}" with arguments:`, JSON.stringify(args))
    const result = await client.callTool({
      name: toolName,
      arguments: args
    })

    if (result.isError) {
      const errorMsg = result.content?.[0]?.text || 'Tool execution failed'
      throw new Error(errorMsg)
    }

    const outputText = result.content?.[0]?.text || JSON.stringify(result)
    return outputText
  }

  /**
   * Closes all standalone MCP server connections cleanly
   */
  async shutdown() {
    for (const [name, entry] of this.clients.entries()) {
      try {
        await entry.client.close()
      } catch (err) {
        console.warn(`[MCPManager] Error closing MCP server "${name}":`, err)
      }
    }
    this.clients.clear()
    this.toolToClientMap.clear()
    this.initialized = false
  }
}

export const mcpManager = new MCPManager()
