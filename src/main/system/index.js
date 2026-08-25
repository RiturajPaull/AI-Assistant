import { getCPU } from './cpu'
import { getMemory } from './memory'
import { getGPU } from './gpu'
import { getBattery } from './battery'
import { getNetwork } from './network'
import { getProcesses } from './processes'

export { getCPU, getMemory, getGPU, getBattery, getNetwork, getProcesses }

export async function getSystemStats() {
  const [cpu, memory, gpu, battery, network, processes] = await Promise.all([
    getCPU().catch(() => ({ usage: 0 })),
    getMemory().catch(() => ({ totalGB: 0, usedGB: 0, freeGB: 0, usage: 0 })),
    getGPU().catch(() => ({ controllers: [] })),
    getBattery().catch(() => ({ hasBattery: false, percent: 100, charging: false, timeRemaining: null })),
    getNetwork().catch(() => []),
    getProcesses().catch(() => ({ total: 0, running: 0, sleeping: 0, list: [] }))
  ])

  return { cpu, memory, gpu, battery, network, processes, timestamp: Date.now() }
}