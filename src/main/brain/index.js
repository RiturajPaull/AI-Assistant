import { detectIntent } from './intent.js'
import { openApplication } from '../tools/applications/open.js'

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

  return {
    command,
    intent: intentName,
    appName: result.appName || null
  }
}
