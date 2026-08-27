import { runAgent } from '../ai/agent.js'
import { detectIntent } from './intent.js'

export async function processCommand(command) {
  if (!command || typeof command !== 'string') {
    return { command: '', intent: 'unknown', message: 'No input provided.' }
  }

  console.log(`\n==================================================`)
  console.log(`[STEP 1: USER INPUT RECEIVED] -> "${command}"`)
  console.log(`==================================================`)

  // Fast-path intent detection for hardware vitals UI widget updates if needed
  const intentCheck = detectIntent(command)

  try {
    // Process input via AI Agent & Standalone MCP Tool Servers
    const agentResult = await runAgent(command)

    console.log(`[STEP 7: FINAL RESPONSE TO RENDERER] -> "${agentResult.message}"\n`)

    return {
      command,
      intent: intentCheck.intent !== 'unknown' ? intentCheck.intent : 'agent',
      appName: intentCheck.appName || null,
      success: agentResult.success,
      message: agentResult.message
    }
  } catch (err) {
    console.error('[Brain] Error processing command:', err)
    return {
      command,
      intent: 'chat',
      success: false,
      message: `I encountered an issue processing that: ${err.message}`
    }
  }
}
