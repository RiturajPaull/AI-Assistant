import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import fs from 'fs'
import path from 'path'

const server = new Server(
  {
    name: 'ev-filesystem-server',
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
        name: 'read_file',
        description: 'Read the textual contents of a file on disk.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'Absolute or relative file path to read' }
          },
          required: ['filePath']
        }
      },
      {
        name: 'write_file',
        description: 'Write or append text content to a file.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'File path to write to' },
            content: { type: 'string', description: 'Text content to write' },
            append: { type: 'boolean', description: 'If true, append content instead of overwriting' }
          },
          required: ['filePath', 'content']
        }
      },
      {
        name: 'search_files',
        description: 'Search for files or list items within a directory path.',
        inputSchema: {
          type: 'object',
          properties: {
            dirPath: { type: 'string', description: 'Directory path to list/search (defaults to current working directory)' },
            pattern: { type: 'string', description: 'Optional text pattern to filter filenames' }
          }
        }
      }
    ]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  console.error(`\n[FILESYSTEM MCP SERVER PROCESS] -> Received tools/call request for tool "${name}"`)

  try {
    if (name === 'read_file') {
      const targetPath = path.resolve(args?.filePath || '.')
      console.error(`[FILESYSTEM MCP SERVER PROCESS] -> Reading file: ${targetPath}`)
      if (!fs.existsSync(targetPath)) {
        throw new Error(`File not found: ${targetPath}`)
      }
      const stats = fs.statSync(targetPath)
      if (stats.isDirectory()) {
        throw new Error(`Path is a directory, not a file: ${targetPath}`)
      }
      const text = fs.readFileSync(targetPath, 'utf8')
      console.error(`[FILESYSTEM MCP SERVER PROCESS] -> Read ${Buffer.byteLength(text)} bytes. Returning over stdio.`)
      return {
        content: [{ type: 'text', text }]
      }
    }

    if (name === 'write_file') {
      const targetPath = path.resolve(args?.filePath)
      const content = args?.content || ''
      const append = Boolean(args?.append)

      console.error(`[FILESYSTEM MCP SERVER PROCESS] -> Writing file: ${targetPath} (append: ${append})`)
      const dir = path.dirname(targetPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      if (append) {
        fs.appendFileSync(targetPath, content, 'utf8')
      } else {
        fs.writeFileSync(targetPath, content, 'utf8')
      }

      console.error(`[FILESYSTEM MCP SERVER PROCESS] -> Wrote file successfully. Returning over stdio.`)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, path: targetPath, bytesWritten: Buffer.byteLength(content) })
          }
        ]
      }
    }

    if (name === 'search_files') {
      const searchDir = path.resolve(args?.dirPath || '.')
      const pattern = args?.pattern ? args.pattern.toLowerCase() : null

      console.error(`[FILESYSTEM MCP SERVER PROCESS] -> Searching directory "${searchDir}" with pattern "${pattern || '*'}"`)
      if (!fs.existsSync(searchDir)) {
        throw new Error(`Directory not found: ${searchDir}`)
      }

      const files = fs.readdirSync(searchDir)
      const matched = files
        .filter((f) => !pattern || f.toLowerCase().includes(pattern))
        .slice(0, 50)
        .map((f) => {
          try {
            const stat = fs.statSync(path.join(searchDir, f))
            return { name: f, isDirectory: stat.isDirectory(), size: stat.size }
          } catch {
            return { name: f, isDirectory: false, size: 0 }
          }
        })

      console.error(`[FILESYSTEM MCP SERVER PROCESS] -> Found ${matched.length} matching item(s). Returning over stdio.`)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ directory: searchDir, items: matched }, null, 2)
          }
        ]
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  } catch (err) {
    console.error(`[FILESYSTEM MCP SERVER ERROR] -> Tool "${name}" failed: ${err.message}`)
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing ${name}: ${err.message}` }]
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[FILESYSTEM MCP SERVER PROCESS] Ready on stdio stream.')
}

main().catch(console.error)
