import si from 'systeminformation'

let cachedCpuStatic = null

export async function getCPU() {
  try {
    if (!cachedCpuStatic) {
      const cpu = await si.cpu()
      cachedCpuStatic = {
        manufacturer: cpu.manufacturer || '',
        brand: cpu.brand || 'Processor',
        cores: cpu.cores || 1,
        physicalCores: cpu.physicalCores || 1,
        speed: cpu.speed || 0
      }
    }
    const load = await si.currentLoad()

    return {
      ...cachedCpuStatic,
      usage: typeof load?.currentLoad === 'number' ? Number(load.currentLoad.toFixed(1)) : 0
    }
  } catch (error) {
    console.error('Error fetching CPU info:', error)
    return {
      manufacturer: '',
      brand: 'Processor',
      cores: 1,
      physicalCores: 1,
      speed: 0,
      usage: 0
    }
  }
}