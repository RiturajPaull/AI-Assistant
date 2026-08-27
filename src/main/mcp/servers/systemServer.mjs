import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import si from 'systeminformation'

const server = new Server(
  {
    name: 'ev-system-server',
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
        name: 'get_cpu_stats',
        description: 'Get CPU load percentage, core count, brand, speed, and hardware info.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_memory_stats',
        description: 'Get RAM total, used, free, and usage percentage.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_battery_stats',
        description: 'Get battery level, charging status, and power stats.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_processes_stats',
        description: 'Get total processes and top CPU/RAM consuming process list.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of top processes to return (default: 10)' }
          }
        }
      },
      {
        name: 'get_network_stats',
        description: 'Get active network interfaces, IP addresses, and throughput.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  console.error(`\n[SYSTEM MCP SERVER PROCESS] -> Received tools/call request for tool "${name}"`)

  try {
    if (name === 'get_cpu_stats') {
      const [cpu, load] = await Promise.all([si.cpu(), si.currentLoad()])
      const data = {
        usage: Math.round(load.currentLoad || 0),
        cores: cpu.cores || 0,
        physicalCores: cpu.physicalCores || 0,
        brand: `${cpu.manufacturer || ''} ${cpu.brand || ''}`.trim(),
        speedGHz: cpu.speed || 0
      }
      console.error(`[SYSTEM MCP SERVER PROCESS] -> Calculated CPU Stats: ${data.usage}% usage across ${data.cores} cores. Returning over stdio.`)
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
    }

    if (name === 'get_memory_stats') {
      const mem = await si.mem()
      const data = {
        totalGB: Number((mem.total / (1024 * 1024 * 1024)).toFixed(2)),
        usedGB: Number((mem.used / (1024 * 1024 * 1024)).toFixed(2)),
        freeGB: Number((mem.free / (1024 * 1024 * 1024)).toFixed(2)),
        usage: Math.round((mem.used / mem.total) * 100)
      }
      console.error(`[SYSTEM MCP SERVER PROCESS] -> Calculated RAM Stats: ${data.usage}% usage (${data.usedGB}GB / ${data.totalGB}GB). Returning over stdio.`)
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
    }

    if (name === 'get_battery_stats') {
      const bat = await si.battery()
      const data = {
        hasBattery: bat.hasBattery,
        percent: bat.percent || 100,
        charging: bat.isCharging || false,
        timeRemaining: bat.timeRemaining || null
      }
      console.error(`[SYSTEM MCP SERVER PROCESS] -> Calculated Battery Stats: ${data.percent}%. Returning over stdio.`)
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
    }

    if (name === 'get_processes_stats') {
      const limit = args?.limit || 10
      const processes = await si.processes()
      const sorted = (processes.list || [])
        .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
        .slice(0, limit)
        .map((p) => ({ pid: p.pid, name: p.name, cpu: Math.round(p.cpu || 0), mem: Math.round(p.mem || 0) }))

      const data = {
        total: processes.all || 0,
        running: processes.running || 0,
        list: sorted
      }
      console.error(`[SYSTEM MCP SERVER PROCESS] -> Fetched ${sorted.length} processes. Returning over stdio.`)
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
    }

    if (name === 'get_network_stats') {
      const net = await si.networkInterfaces()
      const interfaces = (Array.isArray(net) ? net : [])
        .filter((i) => !i.internal && (i.ip4 || i.ip6))
        .map((i) => ({ iface: i.iface, ip4: i.ip4, mac: i.mac, speed: i.speed }))
      console.error(`[SYSTEM MCP SERVER PROCESS] -> Fetched Network Stats. Returning over stdio.`)
      return { content: [{ type: 'text', text: JSON.stringify(interfaces, null, 2) }] }
    }

    throw new Error(`Unknown tool: ${name}`)
  } catch (err) {
    console.error(`[SYSTEM MCP SERVER ERROR] -> Tool "${name}" failed: ${err.message}`)
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing ${name}: ${err.message}` }]
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[SYSTEM MCP SERVER PROCESS] Ready on stdio stream.')
}

main().catch(console.error)
