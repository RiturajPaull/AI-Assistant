import { detectIntent } from './intent.js'
import { openApplication } from '../tools/applications/open.js'
import { askLLM } from '../ai/llm.js'

const OPEN_APP_RESPONSES = [
  (app) => `Sure thing! Opening ${app} for you now...`,
  (app) => `On it! Launching ${app}...`,
  (app) => `Right away! Opening ${app}...`,
  (app) => `Got it! Starting ${app} now...`,
  (app) => `Opening ${app}...`
]

const FAILED_APP_RESPONSES = [
  (app) => `Sorry, I couldn't open ${app}. Please check if it's installed.`,
  (app) => `Unable to launch ${app} right now.`,
  (app) => `Could not find application ${app} on your system.`
]

function getRandomResponse(responses, appName) {
  const formattedApp = appName ? appName.charAt(0).toUpperCase() + appName.slice(1) : 'Application'
  const fn = responses[Math.floor(Math.random() * responses.length)]
  return fn(formattedApp)
}

export async function processCommand(command) {
  const result = detectIntent(command)
  const intentName = result.intent

  if (intentName === 'open_app' && result.appName) {
    try {
      await openApplication(result.appName)
      const speechText = getRandomResponse(OPEN_APP_RESPONSES, result.appName)
      return {
        command,
        intent: 'open_app',
        appName: result.appName,
        success: true,
        message: speechText
      }
    } catch (error) {
      const speechText = getRandomResponse(FAILED_APP_RESPONSES, result.appName)
      return {
        command,
        intent: 'open_app',
        appName: result.appName,
        success: false,
        message: speechText
      }
    }
  }

  if (['get_cpu', 'get_memory', 'get_battery', 'get_processes'].includes(intentName)) {
    return {
      command,
      intent: intentName,
      appName: result.appName || null
    }
  }

  // Conversational AI fallback for general chat, questions, stories, facts, etc.
  try {
    const aiResponse = await askLLM(command)
    return {
      command,
      intent: 'chat',
      message: aiResponse
    }
  } catch (err) {
    return {
      command,
      intent: 'chat',
      message: `I'm EV. How can I assist you today?`
    }
  }
}
