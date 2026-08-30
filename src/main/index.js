import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getSystemStats, getCPU } from './system'
import { processCommand } from './brain/index.js'
import { openApplication } from './tools/applications/open.js'
import { transcribeAudio } from './ai/stt.js'

// Append Chromium switches to support audio media and Speech Recognition
app.commandLine.appendSwitch('enable-features', 'SpeechRecognition,MediaSession')
app.commandLine.appendSwitch('enable-speech-dispatcher')

// Suppress verbose Electron security warnings during development
if (is.dev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    hasShadow: true,
    backgroundColor: '#00000000',
    ...(process.platform === 'win32' ? { backgroundMaterial: 'acrylic' } : {}),
    ...(process.platform === 'darwin' ? { vibrancy: 'hud' } : {}),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  // Auto grant media permissions (microphone for Speech-to-Text)
  session.defaultSession.setPermissionCheckHandler(() => true)
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(true)
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers
  ipcMain.handle('ev:status', async () => {
    return {
      status: 'online',
      message: 'EV backend is alive'
    }
  })

  ipcMain.handle('ev:cpu:stats', async () => {
    try {
      return await getCPU()
    } catch (error) {
      console.error('Error getting CPU stats:', error)
      return { usage: 0 }
    }
  })

  ipcMain.handle('ev:system:stats', async () => {
    try {
      return await getSystemStats()
    } catch (error) {
      console.error('Error getting system stats:', error)
      throw error
    }
  })

  ipcMain.handle('ev:command', async (_, command) => {
    try {
      const result = await processCommand(command)
      return result
    } catch (error) {
      console.error('EV command processing failed:', error)
      throw error
    }
  })

  ipcMain.handle('ev:app:open', async (_, appName) => {
    try {
      return await openApplication(appName)
    } catch (error) {
      console.error('Failed to open app via IPC:', error)
      throw error
    }
  })

  ipcMain.handle('ev:transcribe', async (_, audioArrayBuffer, mimeType, apiKey) => {
    try {
      const buffer = Buffer.from(audioArrayBuffer)
      const transcript = await transcribeAudio(buffer, mimeType, apiKey)
      return { success: true, text: transcript }
    } catch (error) {
      console.error('IPC transcribe failed:', error)
      return { success: false, error: error.message || 'Transcription failed' }
    }
  })

  // Window Controls IPC
  ipcMain.on('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) win.unmaximize()
      else win.maximize()
    }
  })

  ipcMain.on('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
