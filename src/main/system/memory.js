import si from 'systeminformation'

export async function getMemory() {
    const memory = await si.mem()

    const totalGB = memory.total / 1024 ** 3;
    const usedGB = memory.used / 1024 ** 3;
    const freeGB = memory.free / 1024 ** 3;

    return {
        totalGB: Number(totalGB.toFixed(2)),
        usedGB: Number(usedGB.toFixed(2)),
        freeGB: Number(freeGB.toFixed(2)),
        usage: Number(((memory.used / memory.total) * 100).toFixed(1))
    };
}