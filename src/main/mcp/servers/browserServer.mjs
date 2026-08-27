import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const server = new Server(
  {
    name: 'ev-browser-server',
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
        name: 'open_browser_url',
        description: 'Open a website URL or search query in the default system web browser. MANDATORY tool to use whenever the user asks to open YouTube, Google, any website, or search the web.',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'The website URL or search query to open in browser (e.g. https://youtube.com or youtube)' }
          },
          required: ['url']
        }
      }
    ]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  console.error(`\n[BROWSER MCP SERVER PROCESS] -> Received tools/call request for tool "${name}"`)

  try {
    if (name === 'open_browser_url') {
      let targetUrl = args?.url
      if (!targetUrl) throw new Error('url parameter is required')

      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
          targetUrl = `https://${targetUrl}`
        } else if (targetUrl.toLowerCase().includes('youtube')) {
          targetUrl = 'https://www.youtube.com'
        } else {
          targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`
        }
      }

      console.error(`[BROWSER MCP SERVER PROCESS] -> Opening browser to: "${targetUrl}"`)
      const launchCmd = process.platform === 'win32' ? `start "" "${targetUrl}"` : `open "${targetUrl}"`
      await execAsync(launchCmd)

      console.error(`[BROWSER MCP SERVER PROCESS] -> Browser opened successfully. Returning confirmation over stdio.`)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, url: targetUrl, message: `Opened ${targetUrl}` })
          }
        ]
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  } catch (err) {
    console.error(`[BROWSER MCP SERVER ERROR] -> Tool "${name}" failed: ${err.message}`)
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing ${name}: ${err.message}` }]
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[BROWSER MCP SERVER PROCESS] Ready on stdio stream.')
}

main().catch(console.error)
