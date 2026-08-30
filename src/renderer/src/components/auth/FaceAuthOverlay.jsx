import { useEffect, useRef, useState } from 'react'
import {
  loadFaceApiModels,
  extractFaceDescriptor,
  getStoredAuthorizedDescriptor,
  getStoredOwnerName,
  saveAuthorizedDescriptor,
  verifyFaceDescriptor,
  clearAuthorizedDescriptor
} from '../../utils/faceAuth'
import speak from '../../utils/tts'
import { ShieldCheck, ShieldAlert, Camera, RefreshCw, UserCheck, Lock, Scan, CheckCircle2 } from 'lucide-react'

export default function FaceAuthOverlay({ onAuthSuccess, onAuthFailure }) {
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [status, setStatus] = useState('initializing') // initializing, scanning, granted, denied, enrolling
  const [message, setMessage] = useState('INITIALIZING NEURAL NETWORKS...')
  const [storedFaceExists, setStoredFaceExists] = useState(false)
  const [ownerName, setOwnerName] = useState('Boss')
  const [matchDistance, setMatchDistance] = useState(null)
  const [scanProgress, setScanProgress] = useState(15) // 0 to 100%
  const [landmarksCount, setLandmarksCount] = useState(null)
  
  // Name prompt states
  const [isNamePrompt, setIsNamePrompt] = useState(false)
  const [tempDescriptor, setTempDescriptor] = useState(null)
  const [nameInputText, setNameInputText] = useState('')

  const scanIntervalRef = useRef(null)
  const activeStreamRef = useRef(null)

  const setupCameraStream = async () => {
    try {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((t) => t.stop())
      }

      const rawSettings = localStorage.getItem('ev_user_settings')
      let camSettings = {}
      if (rawSettings) {
        try {
          camSettings = JSON.parse(rawSettings).camera || {}
        } catch (e) {
          console.error(e)
        }
      }

      const resMap = {
        '480p': { width: 640, height: 480 },
        '720p': { width: 1280, height: 720 },
        '1080p': { width: 1920, height: 1080 }
      }
      const selectedRes = resMap[camSettings.resolution] || { width: 640, height: 480 }

      const videoConstraints = {
        width: selectedRes.width,
        height: selectedRes.height,
        facingMode: 'user'
      }
      if (camSettings.deviceId && camSettings.deviceId !== 'default') {
        videoConstraints.deviceId = { exact: camSettings.deviceId }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints
      })
      activeStreamRef.current = mediaStream
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      return mediaStream
    } catch (err) {
      console.error('[FaceAuthOverlay] Camera access error:', err)
      setStatus('denied')
      setScanProgress(0)
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setMessage('CAMERA ACCESS DENIED BY OS. ENABLE WINDOWS PRIVACY PERMISSIONS.')
      } else if (err.name === 'NotFoundError') {
        setMessage('NO CAMERA HARDWARE DETECTED.')
      } else {
        setMessage('WEBCAM ACCESS REQUIRED FOR BIOMETRIC SCAN.')
      }
      speak('Webcam access denied. Please check your system camera settings.')
      return null
    }
  }

  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      const rawSettings = localStorage.getItem('ev_user_settings')
      if (rawSettings) {
        try {
          const parsed = JSON.parse(rawSettings)
          if (parsed.auth?.faceAuthEnabled === false) {
            if (onAuthSuccess) onAuthSuccess()
            return
          }
        } catch (e) {
          console.error(e)
        }
      }

      setScanProgress(25)
      const stored = getStoredAuthorizedDescriptor()
      const name = getStoredOwnerName()
      setOwnerName(name)
      setStoredFaceExists(!!stored)

      const modelsLoaded = await loadFaceApiModels()
      if (!isMounted) return

      if (!modelsLoaded) {
        setStatus('denied')
        setMessage('FAILED TO LOAD FACE RECOGNITION MODELS.')
        setScanProgress(0)
        return
      }

      setScanProgress(50)
      setMessage('CONNECTING SENSOR FEED...')
      const mediaStream = await setupCameraStream()
      if (!isMounted || !mediaStream) return

      setScanProgress(65)
      if (stored) {
        setStatus('scanning')
        setMessage('ANALYZING FACIAL GEOMETRY...')
        startFaceScan(stored)
      } else {
        setStatus('enrolling')
        setMessage('NO ENROLLED SUBJECT. LOOK AT CAMERA TO ENROLL.')
      }
    }

    initAuth()

    return () => {
      isMounted = false
      stopScan()
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const stopScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }

  const startFaceScan = (storedDescriptor) => {
    stopScan()
    let attempts = 0
    const maxAttempts = 15 // Scan for up to ~7.5 seconds

    const rawSettings = localStorage.getItem('ev_user_settings')
    let threshold = 0.48
    if (rawSettings) {
      try {
        const parsed = JSON.parse(rawSettings)
        if (parsed.auth?.strictMatchThreshold) {
          threshold = parsed.auth.strictMatchThreshold
        }
      } catch (e) {
        console.error(e)
      }
    }

    scanIntervalRef.current = setInterval(async () => {
      attempts++
      if (!videoRef.current) return

      const prog = Math.min(95, Math.floor(65 + (attempts / maxAttempts) * 30))
      setScanProgress(prog)

      const liveDescriptor = await extractFaceDescriptor(videoRef.current)
      if (!liveDescriptor) {
        setLandmarksCount(null)
        if (attempts >= maxAttempts) {
          stopScan()
          handleDenial('NO FACE DETECTED IN SENSOR VIEW.')
        }
        return
      }

      setLandmarksCount(68) // 68-point facial landmark matrix
      const result = verifyFaceDescriptor(liveDescriptor, storedDescriptor, threshold)
      setMatchDistance(result.distance)

      if (result.isMatch) {
        stopScan()
        handleSuccess()
      } else if (attempts >= maxAttempts) {
        stopScan()
        handleDenial('UNAUTHORIZED SUBJECT DETECTED. ACCESS DENIED.')
      }
    }, 500)
  }

  const handleSuccess = () => {
    const name = getStoredOwnerName()
    setScanProgress(100)
    setStatus('granted')
    setMessage(`ACCESS GRANTED. WELCOME BACK, ${name.toUpperCase()}!`)
    speak(`Access granted. Welcome back, ${name}!`)
    setTimeout(() => {
      if (onAuthSuccess) onAuthSuccess()
    }, 1600)
  }

  const handleDenial = (reasonMsg) => {
    setScanProgress(0)
    setStatus('denied')
    setMessage(reasonMsg || 'UNAUTHORIZED USER DETECTED!')
    speak('Unauthorized user detected. Access denied.')
    if (onAuthFailure) onAuthFailure()
  }

  const handleEnroll = async () => {
    if (!videoRef.current) return
    setMessage('CAPTURING FACIAL DESCRIPTOR MATRIX...')
    setScanProgress(80)
    const descriptor = await extractFaceDescriptor(videoRef.current)

    if (descriptor) {
      setTempDescriptor(descriptor)
      setIsNamePrompt(true)
      setScanProgress(90)
      setMessage('FACE CAPTURED! ENTER YOUR NAME TO COMPLETE ENROLLMENT:')
    } else {
      setScanProgress(40)
      setMessage('FAILED TO LOCK FACE. LOOK DIRECTLY AT SENSOR.')
    }
  }

  const handleSaveOwnerProfile = (e) => {
    if (e) e.preventDefault()
    const finalName = nameInputText.trim() || 'Boss'

    if (tempDescriptor) {
      saveAuthorizedDescriptor(tempDescriptor, finalName)
      setOwnerName(finalName)
      setStoredFaceExists(true)
      setIsNamePrompt(false)
      setScanProgress(100)
      setStatus('granted')
      setMessage(`BIOMETRIC PROFILE CREATED FOR ${finalName.toUpperCase()}!`)
      speak(`Face biometric enrolled successfully. Access granted. Welcome, ${finalName}!`)
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess()
      }, 1600)
    }
  }

  const handleRescan = async () => {
    setScanProgress(30)
    setIsNamePrompt(false)
    let currentStream = activeStreamRef.current
    if (!currentStream || !currentStream.active || currentStream.getVideoTracks().every((t) => t.readyState === 'ended')) {
      currentStream = await setupCameraStream()
    }
    if (!currentStream) return

    setScanProgress(60)
    const stored = getStoredAuthorizedDescriptor()
    if (stored) {
      setStatus('scanning')
      setMessage('RE-SCANNING FACIAL GEOMETRY...')
      startFaceScan(stored)
    } else {
      setStatus('enrolling')
      setMessage('LOOK AT SENSOR TO ENROLL FACE.')
    }
  }

  const handleResetFace = () => {
    clearAuthorizedDescriptor()
    setStoredFaceExists(false)
    setIsNamePrompt(false)
    setTempDescriptor(null)
    setNameInputText('')
    setStatus('enrolling')
    setScanProgress(50)
    setMessage('BIOMETRIC RECORD CLEARED. ENROLL NEW SUBJECT.')
  }

  return (
    <div className="face-auth-overlay">
      <div className={`face-scanner-card ${status}`}>
        {/* Top Sci-Fi Header Telemetry */}
        <div className="hud-top-bar">
          <div className="hud-status-badge">
            {status === 'granted' ? (
              <ShieldCheck size={16} className="hud-icon granted" />
            ) : status === 'denied' ? (
              <ShieldAlert size={16} className="hud-icon denied" />
            ) : (
              <Lock size={16} className="hud-icon scanning" />
            )}
            <span className="hud-badge-title">E.V BIOMETRIC AUTH</span>
          </div>
          <div className="hud-sys-status">
            <span className="hud-dot"></span>
            <span>SYS // ACTIVE</span>
          </div>
        </div>

        {/* Futuristic Camera Viewport Container */}
        <div className={`camera-hud-container ${status}`}>
          {/* Top Frame Status Tag */}
          <div className={`hud-frame-tag ${status}`}>
            {status === 'granted' ? (
              'SCANNING COMPLETE'
            ) : status === 'denied' ? (
              'SCANNING FAILED'
            ) : status === 'enrolling' ? (
              isNamePrompt ? 'ENTER OWNER NAME' : 'ENROLLMENT MODE'
            ) : (
              'SCANNING...'
            )}
          </div>

          {/* Rotating Sci-Fi Ring */}
          <div className="hud-reticle-ring"></div>
          <div className="hud-reticle-ring inner"></div>

          {/* Webcam Feed */}
          <div className="camera-view-viewport">
            <video ref={videoRef} autoPlay muted playsInline className="webcam-feed" />
            
            {/* Sci-Fi Target Overlays */}
            <div className="hud-target-overlay">
              <div className="target-bracket tl"></div>
              <div className="target-bracket tr"></div>
              <div className="target-bracket bl"></div>
              <div className="target-bracket br"></div>
              <div className="target-crosshair"></div>
              {(status === 'scanning' || status === 'enrolling') && <div className="scan-laser"></div>}
            </div>
          </div>
        </div>

        {/* Sci-Fi Progress Bar Loader Panel */}
        <div className="hud-loader-panel">
          <div className="hud-loader-header">
            <span className="hud-loader-title">
              <Scan size={12} className="inline-block mr-1 opacity-80" />
              {status === 'initializing'
                ? 'INITIALIZING...'
                : status === 'granted'
                ? 'VERIFICATION COMPLETE'
                : status === 'denied'
                ? 'SECURITY BREACH'
                : isNamePrompt
                ? 'PROFILE REGISTRATION'
                : 'BIOMETRIC SCANNING'}
            </span>
            <span className="hud-loader-percent">{scanProgress}%</span>
          </div>

          {/* Segmented HUD Progress Bar */}
          <div className="hud-progress-track">
            <div className={`hud-progress-fill ${status}`} style={{ width: `${scanProgress}%` }}>
              <div className="progress-glow-head"></div>
            </div>
            <div className="hud-progress-segments">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className={`hud-seg-tick ${i * 6.25 < scanProgress ? 'active' : ''}`} />
              ))}
            </div>
          </div>

          {/* Status Message Text */}
          <p className="auth-status-text">{message}</p>
        </div>

        {/* Sci-Fi Telemetry Grid Readouts */}
        <div className="hud-telemetry-grid">
          <div className="telemetry-box">
            <span className="tel-label">SUBJECT ID</span>
            <span className="tel-val">
              {storedFaceExists ? `${ownerName.toUpperCase()} // VERIFIED` : isNamePrompt ? 'PENDING NAME' : 'UNKNOWN'}
            </span>
          </div>
          <div className="telemetry-box">
            <span className="tel-label">LANDMARKS</span>
            <span className="tel-val">{landmarksCount ? `${landmarksCount} POINTS` : 'SEARCHING...'}</span>
          </div>
          <div className="telemetry-box">
            <span className="tel-label">MATCH DISTANCE</span>
            <span className="tel-val">
              {matchDistance !== null ? matchDistance.toFixed(3) : '--.--'}
            </span>
          </div>
          <div className="telemetry-box">
            <span className="tel-label">ENCRYPTION</span>
            <span className="tel-val">256-BIT SHA</span>
          </div>
        </div>

        {/* Action Controls & Name Input Form */}
        <div className="auth-actions">
          {status === 'enrolling' && !isNamePrompt && (
            <button type="button" className="auth-btn enroll-btn" onClick={handleEnroll}>
              <UserCheck size={14} /> ENROLL MY FACE
            </button>
          )}

          {isNamePrompt && (
            <form className="hud-name-prompt-form" onSubmit={handleSaveOwnerProfile}>
              <div className="hud-name-input-wrapper">
                <input
                  type="text"
                  value={nameInputText}
                  onChange={(e) => setNameInputText(e.target.value)}
                  placeholder="ENTER YOUR NAME..."
                  className="hud-name-input"
                  autoFocus
                  maxLength={24}
                />
              </div>
              <button type="submit" className="auth-btn enroll-btn confirm-name-btn">
                <CheckCircle2 size={14} /> SAVE OWNER PROFILE
              </button>
            </form>
          )}

          {status === 'denied' && (
            <button type="button" className="auth-btn retry-btn" onClick={handleRescan}>
              <RefreshCw size={14} /> RE-INITIATE SCAN
            </button>
          )}

          {storedFaceExists && !isNamePrompt && (
            <button type="button" className="auth-btn reset-btn" onClick={handleResetFace}>
              <Camera size={14} /> RE-ENROLL OWNER
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
