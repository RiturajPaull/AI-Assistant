import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Map of common app aliases to Windows URI protocols or executable names
const APP_MAP = {
  // Camera & Media
  camera: 'start microsoft.windows.camera:',
  webcam: 'start microsoft.windows.camera:',
  photos: 'start ms-photos:',
  media: 'start mswindowsmusic:',
  spotify: 'start spotify:',
  vlc: 'vlc',
  youtube: 'start https://youtube.com',

  // System Utilities & Settings
  calculator: 'calc',
  calc: 'calc',
  notepad: 'notepad',
  texteditor: 'notepad',
  settings: 'start ms-settings:',
  controlpanel: 'control',
  control: 'control',
  taskmanager: 'start taskmgr',
  taskmgr: 'start taskmgr',
  devicemanager: 'devmgmt.msc',
  explorer: 'explorer',
  fileexplorer: 'explorer',

  // Terminal & Command Line
  cmd: 'start cmd',
  terminal: 'start cmd',
  commandprompt: 'start cmd',
  powershell: 'start powershell',

  // Web Browsers
  browser: 'start msedge',
  chrome: 'start chrome',
  edge: 'start msedge',
  firefox: 'start firefox',
  brave: 'start brave',
  google: 'start https://google.com',

  // Developer & Office Tools
  code: 'code',
  vscode: 'code',
  visualstudio: 'devenv',
  word: 'start winword',
  excel: 'start excel',
  powerpoint: 'start powerpnt',

  // Creative & Accessories
  paint: 'mspaint',
  snippingtool: 'snippingtool',
  screenshot: 'snippingtool',

  // Social & Communication
  whatsapp: 'start whatsapp:',
  discord: 'start discord:',
  telegram: 'start telegram:'
}

/**
 * Launches a desktop application on Windows/OS by name or alias.
 * @param {string} appName - The target app name (e.g., 'camera', 'calculator', 'notepad')
 * @returns {Promise<{ success: boolean, message: string, app: string }>}
 */
export async function openApplication(appName) {
  if (!appName || typeof appName !== 'string') {
    throw new Error('Application name is required.')
  }

  const cleanName = appName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '')

  const launchCommand = APP_MAP[cleanName] || `start "" "${appName}"`

  try {
    console.log(`Executing launch command for "${cleanName}": ${launchCommand}`)
    await execAsync(launchCommand)
    return {
      success: true,
      message: `Opened ${appName}`,
      app: appName
    }
  } catch (error) {
    console.error(`Failed to launch application "${appName}":`, error)
    // Fallback retry using raw start
    try {
      await execAsync(`start ${appName}`)
      return {
        success: true,
        message: `Opened ${appName}`,
        app: appName
      }
    } catch (_fallbackError) {
      throw new Error(`Unable to launch ${appName}. Please make sure it is installed.`)
    }
  }
}
