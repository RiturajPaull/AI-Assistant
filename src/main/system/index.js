import { getCPU } from './cpu'
import { getMemory } from './memory'
import { getGPU } from './gpu'
import { getBattery } from './battery'
import { getNetwork } from './network'
import { getProcesses } from './processes'


export async function getSystemStats() {
   const [
    cpu,
    memory,
    gpu,
    battery,
    network,
    processes
   ] = await Promise.all([
    getCPU(),
    getMemory(),
    getGPU(),
    getBattery(),
    getNetwork(),
    getProcesses()
   ]);

   return { cpu, memory, gpu, battery, network, processes, timestamp: Date.now() };
};