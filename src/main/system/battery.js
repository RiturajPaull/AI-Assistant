import si from 'systeminformation'

let cachedHasBattery = null
let lastBatteryFetch = 0
let cachedBatteryResult = null

export async function getBattery() {
  if (cachedHasBattery === false) {
    return { hasBattery: false, percent: 100, charging: false, timeRemaining: null }
  }

  const now = Date.now()
  if (cachedBatteryResult && now - lastBatteryFetch < 6000) {
    return cachedBatteryResult
  }

  try {
    const battery = await si.battery()
    cachedHasBattery = battery.hasBattery
    cachedBatteryResult = {
      hasBattery: battery.hasBattery,
      percent: battery.percent,
      charging: battery.isCharging,
      timeRemaining: battery.timeRemaining
    }
    lastBatteryFetch = now
    return cachedBatteryResult
  } catch (_e) {
    return { hasBattery: false, percent: 100, charging: false, timeRemaining: null }
  }
}
