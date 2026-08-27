import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const APP_MAP = {
  camera: 'start microsoft.windows.camera:',
  webcam: 'start microsoft.windows.camera:',
  photos: 'start ms-photos:',
  spotify: 'start spotify:',
  youtube: 'start https://youtube.com',
  calculator: 'calc',
  calc: 'calc',
  notepad: 'notepad',
  settings: 'start ms-settings:',
  controlpanel: 'control',
  control: 'control',
  taskmanager: 'start taskmgr',
  taskmgr: 'start taskmgr',
  explorer: 'explorer',
  cmd: 'start cmd',
  terminal: 'start cmd',
  powershell: 'start powershell',
  browser: 'start msedge',
  chrome: 'start chrome',
  edge: 'start msedge',
  firefox: 'start firefox',
  brave: 'start brave',
  code: 'code',
  vscode: 'code',
  word: 'start winword',
  excel: 'start excel',
  powerpoint: 'start powerpnt',
  paint: 'mspaint',
  snippingtool: 'snippingtool',
  whatsapp: 'start whatsapp:',
  discord: 'start discord:'
}

const server = new Server(
  {
    name: 'ev-app-server',
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
        name: 'open_application',
        description: 'Launch a desktop application or software by name (e.g. calculator, notepad, chrome, vscode, spotify, cmd, camera). MANDATORY tool to use when user asks to open or launch an app.',
        inputSchema: {
          type: 'object',
          properties: {
            appName: { type: 'string', description: 'Target application name or executable alias' }
          },
          required: ['appName']
        }
      },
      {
        name: 'close_application',
        description: 'Close or terminate a running desktop application by process name. MANDATORY tool to use when user asks to close or exit an app.',
        inputSchema: {
          type: 'object',
          properties: {
            appName: { type: 'string', description: 'Application or executable name to terminate (e.g., notepad, chrome)' }
          },
          required: ['appName']
        }
      }
    ]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  console.error(`\n[APPLICATION MCP SERVER PROCESS] -> Received tools/call request for tool "${name}"`)

  try {
    if (name === 'open_application') {
      const appName = args?.appName
      if (!appName) throw new Error('appName parameter is required')

      const cleanName = appName.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
      const launchCommand = APP_MAP[cleanName] || `start "" "${appName}"`

      console.error(`[APPLICATION MCP SERVER PROCESS] -> Launching application "${appName}" via command: ${launchCommand}`)
      try {
        await execAsync(launchCommand)
      } catch (err) {
        await execAsync(`start ${appName}`)
      }

      console.error(`[APPLICATION MCP SERVER PROCESS] -> Successfully launched "${appName}". Returning confirmation over stdio.`)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, message: `Successfully launched ${appName}` }, null, 2)
          }
        ]
      }
    }

    if (name === 'close_application') {
      const appName = args?.appName
      if (!appName) throw new Error('appName parameter is required')

      const exeName = appName.toLowerCase().endsWith('.exe') ? appName : `${appName}.exe`
      console.error(`[APPLICATION MCP SERVER PROCESS] -> Terminating process "${exeName}"...`)
      await execAsync(`taskkill /IM "${exeName}" /F`)

      console.error(`[APPLICATION MCP SERVER PROCESS] -> Successfully closed "${exeName}". Returning confirmation over stdio.`)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, message: `Terminated ${exeName}` }, null, 2)
          }
        ]
      }
    }

    throw new Error(`Unknown tool: ${name}`)
  } catch (err) {
    console.error(`[APPLICATION MCP SERVER ERROR] -> Tool "${name}" failed: ${err.message}`)
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing ${name}: ${err.message}` }]
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[APPLICATION MCP SERVER PROCESS] Ready on stdio stream.')
}

main().catch(console.error)
