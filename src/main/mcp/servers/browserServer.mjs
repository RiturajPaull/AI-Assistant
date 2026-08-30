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
        description: 'Open a website URL or platform search query in the default web browser. MANDATORY tool to use whenever the user asks to open YouTube, Google, search videos/music, or query any website.',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'The website URL, search query, or platform query to open (e.g. "search lo-fi music on YouTube", "https://youtube.com", "electron js on github")' }
          },
          required: ['url']
        }
      }
    ]
  }
})

function resolveTargetUrl(input) {
  let targetUrl = (input || '').trim()
  if (!targetUrl) throw new Error('url parameter is required')

  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    return targetUrl
  }

  if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
    return `https://${targetUrl}`
  }

  const lower = targetUrl.toLowerCase()

  // 1. YouTube Search Detection
  if (lower.includes('youtube') || lower.includes('yt')) {
    let query = targetUrl
      .replace(/^(search|find|play|open|look for|show)\s+/i, '')
      .replace(/\s+(on|in|via|at|from)\s+(youtube|yt)$/i, '')
      .replace(/^(youtube|yt)\s+(search|for)?\s*/i, '')
      .replace(/^(for)\s+/i, '')
      .trim()

    if (!query || query.toLowerCase() === 'youtube' || query.toLowerCase() === 'yt') {
      return 'https://www.youtube.com'
    }

    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  }

  // 2. GitHub Search Detection
  if (lower.includes('github')) {
    let query = targetUrl
      .replace(/^(search|find|open|look for|show)\s+/i, '')
      .replace(/\s+(on|in|via|at|from)\s+github$/i, '')
      .replace(/^github\s+(search|for)?\s*/i, '')
      .trim()

    if (!query || query.toLowerCase() === 'github') {
      return 'https://github.com'
    }

    return `https://github.com/search?q=${encodeURIComponent(query)}`
  }

  // 3. Reddit Search Detection
  if (lower.includes('reddit')) {
    let query = targetUrl
      .replace(/^(search|find|open|look for|show)\s+/i, '')
      .replace(/\s+(on|in|via|at|from)\s+reddit$/i, '')
      .replace(/^reddit\s+(search|for)?\s*/i, '')
      .trim()

    if (!query || query.toLowerCase() === 'reddit') {
      return 'https://www.reddit.com'
    }

    return `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`
  }

  // 4. Wikipedia Search Detection
  if (lower.includes('wikipedia') || lower.includes('wiki')) {
    let query = targetUrl
      .replace(/^(search|find|open|look for|show)\s+/i, '')
      .replace(/\s+(on|in|via|at|from)\s+(wikipedia|wiki)$/i, '')
      .replace(/^(wikipedia|wiki)\s+(search|for)?\s*/i, '')
      .trim()

    if (!query || query.toLowerCase() === 'wikipedia' || query.toLowerCase() === 'wiki') {
      return 'https://www.wikipedia.org'
    }

    return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`
  }

  // 5. Default: Google Search
  let cleanGoogleQuery = targetUrl.replace(/^(search|find|google|look for)\s+/i, '').trim()
  if (!cleanGoogleQuery) cleanGoogleQuery = targetUrl

  return `https://www.google.com/search?q=${encodeURIComponent(cleanGoogleQuery)}`
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  console.error(`\n[BROWSER MCP SERVER PROCESS] -> Received tools/call request for tool "${name}"`)

  try {
    if (name === 'open_browser_url') {
      const rawUrl = args?.url
      const targetUrl = resolveTargetUrl(rawUrl)

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
