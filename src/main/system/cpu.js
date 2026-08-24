import si from "systeminformation"

let cachedCpuStatic = null;

export async function getCPU() {
    if (!cachedCpuStatic) {
        const cpu = await si.cpu();
        cachedCpuStatic = {
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            cores: cpu.cores,
            physicalCores: cpu.physicalCores,
            speed: cpu.speed
        };
    }
    const load = await si.currentLoad();

    return {
        ...cachedCpuStatic,
        usage: Number(load.currentLoad.toFixed(1))
    };
}