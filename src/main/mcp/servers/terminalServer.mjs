import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const server = new Server(
  {
    name: 'ev-terminal-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_command',
        description: 'Execute a shell/terminal command safely and return standard output or error.',
        inputSchema: {
          type: 'object',
          properties: {
            command: { type: 'string', description: 'The terminal command string to run' },
            cwd: { type: 'string', description: 'Optional working directory path' }
          },
          required: ['command']
        }
      }
    ]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  console.error(`\n[TERMINAL MCP SERVER PROCESS] -> Received tools/call request for tool "${name}"`)

  try {
    if (name === 'execute_command') {
      const command = args?.command
      if (!command) throw new Error('command parameter is required')

      const options = {
        cwd: args?.cwd || process.cwd(),
        maxBuffer: 1024 * 1024 * 5,
        timeout: 30000
      }

      console.error(`[TERMINAL MCP SERVER PROCESS] -> Executing command: "${command}" (cwd: ${options.cwd})`)
      const { stdout, stderr } = await execAsync(command, options)

      console.error(`[TERMINAL MCP SERVER PROCESS] -> Command executed successfully. Output length: ${stdout.length} bytes. Returning over stdio.`)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ stdout: stdout.trim(), stderr: stderr.trim() }, null, 2)
          }
        ]
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  } catch (err) {
    console.error(`[TERMINAL MCP SERVER ERROR] -> Command execution failed: ${err.message}`)
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing command: ${err.message}` }]
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[TERMINAL MCP SERVER PROCESS] Ready on stdio stream.')
}

main().catch(console.error)
