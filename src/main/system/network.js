import si from 'systeminformation'

export async function getNetwork() {
  try {
    const stats = await si.networkStats()
    if (!Array.isArray(stats)) return []

    return stats.map((network) => ({
      interface: network.iface || '',
      rxBytes: network.rx_bytes || 0,
      txBytes: network.tx_bytes || 0,
      rxSec: network.rx_sec || 0,
      txSec: network.tx_sec || 0
    }))
  } catch (error) {
    console.error('Error fetching network stats:', error)
    return []
  }
}