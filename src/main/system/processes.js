import si from 'systeminformation'

let lastProcessFetch = 0
let cachedProcesses = null

export async function getProcesses() {
  const now = Date.now()
  if (cachedProcesses && now - lastProcessFetch < 3000) {
    return cachedProcesses
  }

  try {
    const processes = await si.processes()
    cachedProcesses = {
      total: processes.all || 0,
      running: processes.running || 0,
      sleeping: processes.sleeping || 0,
      list: (processes.list || [])
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 10)
        .map((proc) => ({
          pid: proc.pid,
          name: proc.name,
          cpu: proc.cpu,
          memory: proc.mem
        }))
    }
    lastProcessFetch = now
    return cachedProcesses
  } catch (_e) {
    return cachedProcesses || { total: 0, running: 0, sleeping: 0, list: [] }
  }
}
