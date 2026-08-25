export function detectIntent(command) {
    const text = command.toLowerCase().trim();

    if (
        text.includes('cpu') ||
        text.includes('processor')
    ) {
        return 'get_cpu';
    }

    if (
        text.includes('ram') ||
        text.includes('memory')
    ) {
        return 'get_memory';
    }

    if (
        text.includes('battery') ||
        text.includes('charge')
    ) {
        return 'get_battery';
    }

    if (
        text.includes('process') ||
        text.includes('running')
    ) {
        return 'get_processes';
    }

    return 'unknown';
}
