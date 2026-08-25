import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

const evApi = {
  getStatus: () => ipcRenderer.invoke('ev:status'),
  command: (command) => ipcRenderer.invoke('ev:command', command),
  system: {
    getCPU: () => ipcRenderer.invoke('ev:cpu:stats'),
    getStats: () => ipcRenderer.invoke('ev:system:stats'),
    getSystemStats: () => ipcRenderer.invoke('ev:system:stats'),
    command: (command) =>
      ipcRenderer.invoke('ev:command', command)

  }
}

const systemApi = {
  getCPU: () => ipcRenderer.invoke('ev:cpu:stats'),
  getStats: () => ipcRenderer.invoke('ev:system:stats'),
  getSystemStats: () => ipcRenderer.invoke('ev:system:stats'),
  command: (command) =>
    ipcRenderer.invoke('ev:command', command)
}

const windowControlsApi = {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('ev', evApi)
    contextBridge.exposeInMainWorld('system', systemApi)
    contextBridge.exposeInMainWorld('windowControls', windowControlsApi)
    contextBridge.exposeInMainWorld('evSystem', systemApi)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.ev = evApi
  window.system = systemApi
  window.windowControls = windowControlsApi
  window.evSystem = systemApi
}


