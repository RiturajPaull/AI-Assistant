import { useState, useRef, useCallback, useEffect } from 'react'

export function useVoiceRecorder(options = {}) {
  const {
    onTranscription,
    onError,
    silenceThreshold = 6,
    silenceDuration = 900,
    maxRecordingDuration = 6000
  } = options

  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const audioContextRef = useRef(null)
  const animFrameRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const maxTimerRef = useRef(null)
  const hasSpokenRef = useRef(false)

  const isSupported =
    typeof window !== 'undefined' &&
    Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

  const cleanupAudioContext = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current)
      maxTimerRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
  }, [])

  const stopRecording = useCallback(() => {
    cleanupAudioContext()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [cleanupAudioContext])

  const startRecording = useCallback(async () => {
    if (isRecording || isTranscribing) return
    setError(null)
    audioChunksRef.current = []
    hasSpokenRef.current = false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      // Safety max duration timer (auto stop after maxRecordingDuration if silence isn't triggered)
      maxTimerRef.current = setTimeout(() => {
        console.log('Max recording duration reached, auto stopping...')
        stopRecording()
      }, maxRecordingDuration)

      // Setup Web Audio API Silence / Voice Activity Detection
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        const audioCtx = new AudioContext()
        audioContextRef.current = audioCtx
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const checkVolume = () => {
          if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return

          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const averageVolume = sum / dataArray.length

          // Check if user has started speaking
          if (averageVolume > silenceThreshold) {
            hasSpokenRef.current = true
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current)
              silenceTimerRef.current = null
            }
          } else if (hasSpokenRef.current && !silenceTimerRef.current) {
            // User finished speaking -> auto stop on silence
            silenceTimerRef.current = setTimeout(() => {
              console.log('Silence detected after speech, auto-stopping recording hands-free!')
              stopRecording()
            }, silenceDuration)
          }

          animFrameRef.current = requestAnimationFrame(checkVolume)
        }

        checkVolume()
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false)
        setIsTranscribing(true)
        cleanupAudioContext()

        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType
          })
          const arrayBuffer = await audioBlob.arrayBuffer()

          let transcriptText = ''
          if (window.ev?.transcribeAudio) {
            const res = await window.ev.transcribeAudio(arrayBuffer, mimeType)
            if (res && res.success) {
              transcriptText = res.text
            } else {
              throw new Error(res?.error || 'Transcription failed')
            }
          } else {
            throw new Error('Transcription IPC unavailable')
          }

          setIsTranscribing(false)
          if (onTranscription && transcriptText) {
            onTranscription(transcriptText)
          }
        } catch (err) {
          console.error('Audio transcription error:', err)
          setIsTranscribing(false)
          setError(err.message || 'Failed to transcribe audio')
          if (onError) onError(err.message || 'Failed to transcribe audio')
        } finally {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
          }
        }
      }

      mediaRecorder.start(100)
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start microphone recording:', err)
      setError('Microphone access denied')
      if (onError) onError('Microphone access denied')
    }
  }, [
    isRecording,
    isTranscribing,
    silenceThreshold,
    silenceDuration,
    maxRecordingDuration,
    stopRecording,
    cleanupAudioContext,
    onTranscription,
    onError
  ])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  useEffect(() => {
    return () => {
      cleanupAudioContext()
    }
  }, [cleanupAudioContext])

  return {
    isRecording,
    isTranscribing,
    error,
    isSupported,
    startRecording,
    stopRecording,
    toggleRecording
  }
}

export default useVoiceRecorder
