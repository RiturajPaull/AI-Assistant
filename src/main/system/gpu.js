import si from 'systeminformation'

let cachedGPU = null;

export async function getGPU() {
    if (!cachedGPU) {
        try {
            const graphics = await si.graphics();
            cachedGPU = {
                controllers: (graphics.controllers || []).map(ctrl => ({
                    model: ctrl.model,
                    vendor: ctrl.vendor,
                    vram: ctrl.vram,
                    temperature: ctrl.temperatureGpu,
                }))
            };
        } catch (e) {
            cachedGPU = { controllers: [] };
        }
    }
    return cachedGPU;
}

