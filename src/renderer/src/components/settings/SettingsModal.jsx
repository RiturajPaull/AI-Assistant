import { useState, useEffect, useRef } from 'react'
import {
  X,
  Palette,
  Volume2,
  Mic,
  Camera,
  ShieldCheck,
  Cpu,
  LockKeyhole,
  Sliders,
  RotateCcw,
  Check,
  Lock,
  Trash2,
  Zap
} from 'lucide-react'
import { getStoredOwnerName, clearAuthorizedDescriptor } from '../../utils/faceAuth'
import speak from '../../utils/tts'

const DEFAULT_SETTINGS = {
  appearance: {
    theme: 'cyber-dark',
    showGrid: true,
    glowIntensity: 80,
    transparency: 90
  },
  voice: {
    voiceName: '',
    speechRate: 1.1,
    speechPitch: 1.2,
    speechVolume: 1.0,
    ttsEnabled: true
  },
  microphone: {
    deviceId: 'default',
    noiseSuppression: true,
    echoCancellation: true,
    sensitivity: 75
  },
  camera: {
    deviceId: 'default',
    resolution: '720p',
    mirror: true
  },
  auth: {
    faceAuthEnabled: true,
    ownerName: 'Boss',
    strictMatchThreshold: 0.48
  },
  aiModel: {
    provider: 'ollama',
    modelName: 'llama3',
    endpointUrl: 'http://localhost:11434',
    temperature: 0.7
  },
  permissions: {
    appLaunch: true,
    sysInfoAccess: true,
    fileAccess: true
  },
  advanced: {
    logLevel: 'info',
    hardwareAccel: true,
    developerMode: false
  }
}

export default function SettingsModal({
  isOpen,
  onClose,
  systemVoices = [],
  activeVoiceName = '',
  onVoiceChange,
  onSettingsChange,
  onLockApp
}) {
  const [activeTab, setActiveTab] = useState('appearance')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [savedBanner, setSavedBanner] = useState(false)

  const [audioInputs, setAudioInputs] = useState([])
  const [videoInputs, setVideoInputs] = useState([])
  const previewTimerRef = useRef(null)

  const triggerVoicePreview = (rate, pitch, volume) => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current)
    }
    previewTimerRef.current = setTimeout(() => {
      speak('Testing EV acoustic parameters.', {
        rate: rate !== undefined ? rate : settings.voice.speechRate,
        pitch: pitch !== undefined ? pitch : settings.voice.speechPitch,
        volume: volume !== undefined ? volume : settings.voice.speechVolume,
        force: true
      })
    }, 250)
  }

  useEffect(() => {
    const raw = localStorage.getItem('ev_user_settings')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        const merged = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          auth: {
            ...DEFAULT_SETTINGS.auth,
            ownerName: getStoredOwnerName(),
            ...(parsed.auth || {})
          }
        }
        setSettings(merged)
        if (onSettingsChange) onSettingsChange(merged)
      } catch (err) {
        console.error('Failed to parse ev_user_settings:', err)
      }
    } else {
      const merged = {
        ...DEFAULT_SETTINGS,
        auth: {
          ...DEFAULT_SETTINGS.auth,
          ownerName: getStoredOwnerName()
        }
      }
      setSettings(merged)
      if (onSettingsChange) onSettingsChange(merged)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const fetchMediaDevices = async () => {
      try {
        if (navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices()
          setAudioInputs(devices.filter((d) => d.kind === 'audioinput'))
          setVideoInputs(devices.filter((d) => d.kind === 'videoinput'))
        }
      } catch (e) {
        console.warn('Could not enumerate media devices:', e)
      }
    }
    fetchMediaDevices()
  }, [isOpen])

  if (!isOpen) return null

  const updateSetting = (category, key, value) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }
      localStorage.setItem('ev_user_settings', JSON.stringify(updated))
      if (onSettingsChange) onSettingsChange(updated)
      return updated
    })
  }

  const triggerSaveNotification = () => {
    setSavedBanner(true)
    setTimeout(() => setSavedBanner(false), 2000)
  }

  const handleOwnerNameChange = (newName) => {
    updateSetting('auth', 'ownerName', newName)
    localStorage.setItem('ev_authorized_owner_name', newName)
  }

  const handleResetFaceAuth = () => {
    if (window.confirm('Clear stored face authorization scan? EV will require a new face enrollment on lock.')) {
      clearAuthorizedDescriptor()
      speak('Authorized face data cleared.')
      triggerSaveNotification()
    }
  }

  const handleResetAllDefaults = () => {
    if (window.confirm('Reset all EV Settings to factory defaults?')) {
      localStorage.removeItem('ev_user_settings')
      setSettings(DEFAULT_SETTINGS)
      if (onSettingsChange) onSettingsChange(DEFAULT_SETTINGS)
      speak('EV settings reset to factory defaults.')
      triggerSaveNotification()
    }
  }

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'voice', label: 'Voice', icon: Volume2 },
    { id: 'microphone', label: 'Microphone', icon: Mic },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'auth', label: 'Authentication', icon: ShieldCheck },
    { id: 'aiModel', label: 'AI Model', icon: Cpu },
    { id: 'permissions', label: 'Permissions', icon: LockKeyhole },
    { id: 'advanced', label: 'Advanced', icon: Sliders }
  ]

  return (
    <div className="ev-settings-overlay" onClick={onClose}>
      <div className="ev-settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header Bar */}
        <div className="ev-settings-header">
          <div className="ev-settings-title">
            <Zap size={18} className="text-amber-400" />
            <span>E.V CONFIGURATION SYSTEM</span>
          </div>
          <button type="button" className="ev-settings-close-btn" onClick={onClose} title="Close Settings">
            <X size={18} />
          </button>
        </div>

        {/* Saved Toast Notification Banner */}
        {savedBanner && (
          <div className="ev-settings-toast">
            <Check size={14} />
            <span>SETTINGS SAVED & APPLIED</span>
          </div>
        )}

        {/* Main Settings Body Grid (Sidebar + Tab Content) */}
        <div className="ev-settings-body">
          {/* Left Navigation Sidebar */}
          <div className="ev-settings-sidebar">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`ev-settings-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Panel Content */}
          <div className="ev-settings-content">
            {/* 1. APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h3>EV APPEARANCE & THEME</h3>
                <div className="setting-row">
                  <label>Color Theme</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => {
                      updateSetting('appearance', 'theme', e.target.value)
                      triggerSaveNotification()
                    }}
                  >
                    <option value="cyber-dark">Cyberpunk Amber & Dark Blue (Default)</option>
                    <option value="neon-cyan">Neon Cyan Synthwave</option>
                    <option value="matrix-green">Matrix Protocol Green</option>
                    <option value="ember-orange">Ember Core Orange</option>
                  </select>
                </div>

                <div className="setting-row">
                  <label>Background Sci-Fi Grid Overlay</label>
                  <input
                    type="checkbox"
                    checked={settings.appearance.showGrid}
                    onChange={(e) => {
                      updateSetting('appearance', 'showGrid', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>HUD Glow Intensity ({settings.appearance.glowIntensity}%)</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={settings.appearance.glowIntensity}
                    onChange={(e) => {
                      updateSetting('appearance', 'glowIntensity', Number(e.target.value))
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>Glassmorphic Transparency ({settings.appearance.transparency}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={settings.appearance.transparency}
                    onChange={(e) => {
                      updateSetting('appearance', 'transparency', Number(e.target.value))
                    }}
                  />
                </div>
              </div>
            )}

            {/* 2. VOICE */}
            {activeTab === 'voice' && (
              <div className="settings-section">
                <h3>VOICE & SYNTHESIS</h3>
                <div className="setting-row">
                  <label>Enable Voice Output (TTS)</label>
                  <input
                    type="checkbox"
                    checked={settings.voice.ttsEnabled}
                    onChange={(e) => {
                      updateSetting('voice', 'ttsEnabled', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>System Acoustic Voice</label>
                  <select
                    value={activeVoiceName}
                    onChange={(e) => {
                      if (onVoiceChange) onVoiceChange(e.target.value)
                      updateSetting('voice', 'voiceName', e.target.value)
                      triggerSaveNotification()
                    }}
                  >
                    {systemVoices.length === 0 ? (
                      <option value="">Loading system voices...</option>
                    ) : (
                      systemVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name.replace(/^Microsoft\s*/i, '').replace(/\s*Desktop/i, '')} ({v.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="setting-row">
                  <label>Speech Rate ({settings.voice.speechRate}x)</label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.8"
                    step="0.1"
                    value={settings.voice.speechRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      updateSetting('voice', 'speechRate', val)
                      triggerVoicePreview(val, undefined, undefined)
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>Speech Pitch ({settings.voice.speechPitch})</label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.6"
                    step="0.05"
                    value={settings.voice.speechPitch}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      updateSetting('voice', 'speechPitch', val)
                      triggerVoicePreview(undefined, val, undefined)
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>Volume Level ({Math.round(settings.voice.speechVolume * 100)}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.voice.speechVolume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      updateSetting('voice', 'speechVolume', val)
                      triggerVoicePreview(undefined, undefined, val)
                    }}
                  />
                </div>

                <div className="action-buttons-group">
                  <button
                    type="button"
                    className="ev-btn-secondary"
                    onClick={() =>
                      triggerVoicePreview(
                        settings.voice.speechRate,
                        settings.voice.speechPitch,
                        settings.voice.speechVolume
                      )
                    }
                  >
                    <Volume2 size={14} /> Test Selected Voice Audio
                  </button>
                </div>
              </div>
            )}

            {/* 3. MICROPHONE */}
            {activeTab === 'microphone' && (
              <div className="settings-section">
                <h3>MICROPHONE & AUDIO INPUT</h3>
                <div className="setting-row">
                  <label>Audio Input Device</label>
                  <select
                    value={settings.microphone.deviceId}
                    onChange={(e) => {
                      updateSetting('microphone', 'deviceId', e.target.value)
                      triggerSaveNotification()
                    }}
                  >
                    <option value="default">Default System Microphone</option>
                    {audioInputs.map((device, idx) => (
                      <option key={device.deviceId || idx} value={device.deviceId}>
                        {device.label || `Microphone ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-row">
                  <label>Active Noise Suppression</label>
                  <input
                    type="checkbox"
                    checked={settings.microphone.noiseSuppression}
                    onChange={(e) => {
                      updateSetting('microphone', 'noiseSuppression', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>Acoustic Echo Cancellation</label>
                  <input
                    type="checkbox"
                    checked={settings.microphone.echoCancellation}
                    onChange={(e) => {
                      updateSetting('microphone', 'echoCancellation', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>Voice Sensitivity ({settings.microphone.sensitivity}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.microphone.sensitivity}
                    onChange={(e) => {
                      updateSetting('microphone', 'sensitivity', Number(e.target.value))
                    }}
                  />
                </div>
              </div>
            )}

            {/* 4. CAMERA */}
            {activeTab === 'camera' && (
              <div className="settings-section">
                <h3>CAMERA & VISION CAPTURE</h3>
                <div className="setting-row">
                  <label>Video Input Device</label>
                  <select
                    value={settings.camera.deviceId}
                    onChange={(e) => {
                      updateSetting('camera', 'deviceId', e.target.value)
                      triggerSaveNotification()
                    }}
                  >
                    <option value="default">Default System Webcam</option>
                    {videoInputs.map((device, idx) => (
                      <option key={device.deviceId || idx} value={device.deviceId}>
                        {device.label || `Camera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-row">
                  <label>Facial Recognition Resolution</label>
                  <select
                    value={settings.camera.resolution}
                    onChange={(e) => {
                      updateSetting('camera', 'resolution', e.target.value)
                      triggerSaveNotification()
                    }}
                  >
                    <option value="480p">480p SD (Fast / Low CPU)</option>
                    <option value="720p">720p HD (Balanced - Recommended)</option>
                    <option value="1080p">1080p Full HD (High Precision)</option>
                  </select>
                </div>

                <div className="setting-row">
                  <label>Mirror Video Feed</label>
                  <input
                    type="checkbox"
                    checked={settings.camera.mirror}
                    onChange={(e) => {
                      updateSetting('camera', 'mirror', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>
              </div>
            )}

            {/* 5. AUTHENTICATION */}
            {activeTab === 'auth' && (
              <div className="settings-section">
                <h3>BIOMETRIC AUTHENTICATION</h3>
                <div className="setting-row">
                  <label>Require Face Authentication on Startup</label>
                  <input
                    type="checkbox"
                    checked={settings.auth.faceAuthEnabled}
                    onChange={(e) => {
                      updateSetting('auth', 'faceAuthEnabled', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>Authorized Owner Name</label>
                  <input
                    type="text"
                    className="setting-text-input"
                    value={settings.auth.ownerName}
                    onChange={(e) => handleOwnerNameChange(e.target.value)}
                    placeholder="Boss / Sir"
                  />
                </div>

                <div className="setting-row">
                  <label>Face Match Precision Threshold ({settings.auth.strictMatchThreshold})</label>
                  <input
                    type="range"
                    min="0.35"
                    max="0.60"
                    step="0.01"
                    value={settings.auth.strictMatchThreshold}
                    onChange={(e) => {
                      updateSetting('auth', 'strictMatchThreshold', parseFloat(e.target.value))
                    }}
                  />
                </div>

                <div className="action-buttons-group">
                  <button type="button" className="ev-btn-danger" onClick={handleResetFaceAuth}>
                    <Trash2 size={14} /> Clear Enrolled Face Data
                  </button>
                  <button type="button" className="ev-btn-secondary" onClick={onLockApp}>
                    <Lock size={14} /> Lock App & Require Scan
                  </button>
                </div>
              </div>
            )}

            {/* 6. AI MODEL */}
            {activeTab === 'aiModel' && (
              <div className="settings-section">
                <h3>AI MODEL ENGINE & INFERENCE</h3>
                <div className="setting-row">
                  <label>Inference Provider</label>
                  <select
                    value={settings.aiModel.provider}
                    onChange={(e) => {
                      updateSetting('aiModel', 'provider', e.target.value)
                      triggerSaveNotification()
                    }}
                  >
                    <option value="ollama">Ollama (Local Offline LLM)</option>
                    <option value="openai">OpenAI Cloud API</option>
                    <option value="system">Built-in EV System Logic</option>
                  </select>
                </div>

                <div className="setting-row">
                  <label>Model Identifier</label>
                  <input
                    type="text"
                    className="setting-text-input"
                    value={settings.aiModel.modelName}
                    onChange={(e) => {
                      updateSetting('aiModel', 'modelName', e.target.value)
                    }}
                    placeholder="llama3 / gpt-4o"
                  />
                </div>

                <div className="setting-row">
                  <label>Endpoint / Host Address</label>
                  <input
                    type="text"
                    className="setting-text-input"
                    value={settings.aiModel.endpointUrl}
                    onChange={(e) => {
                      updateSetting('aiModel', 'endpointUrl', e.target.value)
                    }}
                    placeholder="http://localhost:11434"
                  />
                </div>

                <div className="setting-row">
                  <label>Temperature ({settings.aiModel.temperature})</label>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={settings.aiModel.temperature}
                    onChange={(e) => {
                      updateSetting('aiModel', 'temperature', parseFloat(e.target.value))
                    }}
                  />
                </div>
              </div>
            )}

            {/* 7. PERMISSIONS */}
            {activeTab === 'permissions' && (
              <div className="settings-section">
                <h3>SYSTEM PERMISSIONS & INTEGRATION</h3>
                <div className="setting-row">
                  <label>Allow EV to Launch Desktop Apps</label>
                  <input
                    type="checkbox"
                    checked={settings.permissions.appLaunch}
                    onChange={(e) => {
                      updateSetting('permissions', 'appLaunch', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>Access System Performance Stats (CPU/Memory/Battery)</label>
                  <input
                    type="checkbox"
                    checked={settings.permissions.sysInfoAccess}
                    onChange={(e) => {
                      updateSetting('permissions', 'sysInfoAccess', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>File System Access for AI Context</label>
                  <input
                    type="checkbox"
                    checked={settings.permissions.fileAccess}
                    onChange={(e) => {
                      updateSetting('permissions', 'fileAccess', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>
              </div>
            )}

            {/* 8. ADVANCED */}
            {activeTab === 'advanced' && (
              <div className="settings-section">
                <h3>ADVANCED DIAGNOSTICS & SYSTEM CONTROL</h3>
                <div className="setting-row">
                  <label>Logging Verbosity</label>
                  <select
                    value={settings.advanced.logLevel}
                    onChange={(e) => {
                      updateSetting('advanced', 'logLevel', e.target.value)
                      triggerSaveNotification()
                    }}
                  >
                    <option value="info">Info (Standard)</option>
                    <option value="debug">Debug (Verbose Logs)</option>
                    <option value="warn">Warnings Only</option>
                    <option value="error">Errors Only</option>
                  </select>
                </div>

                <div className="setting-row">
                  <label>GPU Hardware Acceleration</label>
                  <input
                    type="checkbox"
                    checked={settings.advanced.hardwareAccel}
                    onChange={(e) => {
                      updateSetting('advanced', 'hardwareAccel', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>

                <div className="setting-row">
                  <label>Enable Developer Inspection Mode</label>
                  <input
                    type="checkbox"
                    checked={settings.advanced.developerMode}
                    onChange={(e) => {
                      updateSetting('advanced', 'developerMode', e.target.checked)
                      triggerSaveNotification()
                    }}
                  />
                </div>

                <div className="action-buttons-group">
                  <button type="button" className="ev-btn-secondary" onClick={handleResetAllDefaults}>
                    <RotateCcw size={14} /> Restore Factory Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
