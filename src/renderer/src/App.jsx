import { useState } from 'react'
import './styles/index.css'
import ResponseRenderer from './components/responses/ResponseRenderer'
import useVoiceRecorder from './hooks/useVoiceRecorder'
import { Mic, MicOff, Loader2 } from 'lucide-react'

function App() {
  const [response, setResponse] = useState(null)
  const [command, setCommand] = useState('')

  const executeCommand = async (textToRun) => {
    const trimmed = textToRun || command.trim()
    if (!trimmed) return

    try {
      let result = null
      if (window.ev?.command) {
        result = await window.ev.command(trimmed)
      } else if (window.ev?.system?.command) {
        result = await window.ev.system.command(trimmed)
      } else if (window.system?.command) {
        result = await window.system.command(trimmed)
      } else {
        console.warn('Command IPC not available on window.ev')
      }

      console.log('EV result:', result)

      if (result && result.intent) {
        switch (result.intent) {
          case 'open_app':
            showResponse({
              type: 'app',
              data: {
                success: result.success,
                message:
                  result.message ||
                  (result.success
                    ? `Opening ${result.appName}...`
                    : `Could not launch ${result.appName}`),
                app: result.appName
              }
            })
            break
          case 'get_cpu':
            await showCPU()
            break
          case 'get_memory':
            await showMemory()
            break
          case 'get_battery':
            await showBattery()
            break
          case 'get_processes':
            await showProcesses()
            break
          case 'unknown':
          default:
            showResponse({
              type: 'text',
              data: `I did not understand: "${trimmed}"`
            })
            break
        }
      }
    } catch (err) {
      console.error('Command failed:', err)
      showResponse({
        type: 'text',
        data: `Command error: ${err.message || 'Failed to process'}`
      })
    }
  }

  const handleTranscription = (transcribedText) => {
    if (transcribedText) {
      setCommand(transcribedText)
      executeCommand(transcribedText)
    }
  }

  const handleVoiceError = (errMessage) => {
    showResponse({
      type: 'text',
      data: `Voice error: ${errMessage}`
    })
  }

  const { isRecording, isTranscribing, isSupported, toggleRecording } = useVoiceRecorder({
    onTranscription: handleTranscription,
    onError: handleVoiceError
  })

  const showResponse = (responseData) => {
    setResponse(responseData)

    setTimeout(() => {
      setResponse(null)
    }, 5000)
  }

  const sendCommand = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    await executeCommand(command)
  }

  const getSystem = async () => {
    try {
      if (window.ev?.system?.getStats) {
        return await window.ev.system.getStats()
      } else if (window.system?.getSystemStats) {
        return await window.system.getSystemStats()
      } else if (window.system?.getStats) {
        return await window.system.getStats()
      }
    } catch (err) {
      console.error('Failed to get system stats:', err)
    }
    return null
  }

  const showCPU = async () => {
    try {
      if (window.ev?.system?.getCPU) {
        const cpu = await window.ev.system.getCPU()
        return showResponse({ type: 'cpu', data: cpu })
      }
      const system = await getSystem()
      if (system?.cpu) {
        showResponse({ type: 'cpu', data: system.cpu })
      }
    } catch (e) {
      console.error('showCPU error:', e)
    }
  }

  const showMemory = async () => {
    try {
      const system = await getSystem()
      if (system?.memory) {
        showResponse({ type: 'memory', data: system.memory })
      }
    } catch (e) {
      console.error('showMemory error:', e)
    }
  }

  const showBattery = async () => {
    try {
      const system = await getSystem()
      if (system?.battery) {
        showResponse({ type: 'battery', data: system.battery })
      }
    } catch (e) {
      console.error('showBattery error:', e)
    }
  }

  const showProcesses = async () => {
    try {
      const system = await getSystem()
      if (system?.processes) {
        showResponse({ type: 'process', data: system.processes })
      }
    } catch (e) {
      console.error('showProcesses error:', e)
    }
  }

  const getOrbStateText = () => {
    if (isRecording) return 'LISTENING'
    if (isTranscribing) return 'THINKING'
    return 'EV'
  }

  return (
    <div className="ev-container">
      <div className="ev-core">
        <div
          className={`ev-ring ${isRecording ? 'listening-ring' : ''} ${isTranscribing ? 'thinking-ring' : ''}`}
        >
          <div
            className={`ev-orb ${isRecording ? 'listening-orb' : ''} ${isTranscribing ? 'thinking-orb' : ''}`}
          >
            {getOrbStateText()}
          </div>
        </div>
      </div>

      <ResponseRenderer response={response} />

      <form className="command-box" onSubmit={sendCommand}>
        {isSupported && (
          <button
            type="button"
            className={`mic-btn ${isRecording ? 'active' : ''} ${isTranscribing ? 'busy' : ''}`}
            onClick={toggleRecording}
            disabled={isTranscribing}
            title={isRecording ? 'Stop & send voice' : 'Click to speak'}
          >
            {isTranscribing ? (
              <Loader2 size={18} className="animate-spin text-amber-400" />
            ) : isRecording ? (
              <MicOff size={18} />
            ) : (
              <Mic size={18} />
            )}
          </button>
        )}
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={
            isRecording
              ? 'Listening to your voice...'
              : isTranscribing
                ? 'Transcribing your voice...'
                : 'Talk or click mic...'
          }
        />
        <button type="submit" disabled={isTranscribing}>
          SEND
        </button>
      </form>

      <div className="test-controls">
        <button type="button" onClick={showCPU}>
          CPU
        </button>
        <button type="button" onClick={showMemory}>
          MEMORY
        </button>
        <button type="button" onClick={showBattery}>
          BATTERY
        </button>
        <button type="button" onClick={showProcesses}>
          PROCESSES
        </button>
      </div>
    </div>
  )
}

export default App
