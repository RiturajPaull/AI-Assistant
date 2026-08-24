import si from 'systeminformation'


export async function getNetwork() {
    const stats = await si.networkStats();

    return stats.map((network) => ({
        interface: network.iface,
        rxBytes: network.rx_bytes,
        txBytes: network.tx_bytes,
        rxSec: network.rx_sec,
        txSec: network.tx_sec,
    }))
}