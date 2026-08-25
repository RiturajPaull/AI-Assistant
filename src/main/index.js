import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { getSystemStats, getCPU } from './system'
import { processCommand } from './brain/index.js'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    alwaysOnTop: true,
    resizable:false,
    show: false,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    hasShadow: true,
    backgroundColor: '#00000000',
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
      const result = processCommand(command)
      return result
    } catch (error) {
      console.error('EV command processing failed:', error)
      throw error
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
