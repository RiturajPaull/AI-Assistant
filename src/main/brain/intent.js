export function detectIntent(command) {
  if (!command || typeof command !== 'string') {
    return { intent: 'unknown', command: '' }
  }

  const text = command.toLowerCase().trim()

  // Hardware Vitals Intents first
  if (text.includes('cpu') || text.includes('processor')) {
    return { intent: 'get_cpu' }
  }

  if (text.includes('ram') || text.includes('memory')) {
    return { intent: 'get_memory' }
  }

  if (text.includes('battery') || text.includes('charge')) {
    return { intent: 'get_battery' }
  }

  if (text.includes('process') || text.includes('running')) {
    return { intent: 'get_processes' }
  }

  // App launching intent patterns
  const openPatterns = [
    /^(?:open|launch|start|run|turn on|show|play)\s+(?:the\s+)?(.+)$/i,
    /^(camera|calculator|calc|notepad|cmd|terminal|browser|chrome|edge|settings|spotify|youtube|vscode|code|paint|whatsapp|discord|taskmanager|explorer)$/i
  ]

  for (const pattern of openPatterns) {
    const match = text.match(pattern)
    if (match) {
      const rawApp = match[1] ? match[1].trim() : text
      return {
        intent: 'open_app',
        appName: rawApp
      }
    }
  }

  return { intent: 'unknown' }
}
