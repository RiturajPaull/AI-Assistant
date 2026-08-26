import { useState, useEffect, useRef, useCallback } from 'react'

export function useSpeechToText(options = {}) {
  const {
    onError,
    onResult,
    onEnd,
    language = 'en-US',
    continuous = false,
    interimResults = true
  } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const mediaStreamRef = useRef(null)

  const SpeechRecognition =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  const isSupported = Boolean(SpeechRecognition)

  useEffect(() => {
    if (!isSupported) return

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let currentTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript
      }
      setTranscript(currentTranscript)
      if (onResult) {
        onResult(currentTranscript, event.results[event.results.length - 1].isFinal)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      const errMessage = event.error || 'speech_error'
      setError(errMessage)
      setIsListening(false)
      if (onError) {
        onError(errMessage)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      if (onEnd) {
        onEnd()
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isSupported, language, continuous, interimResults, onResult, onEnd, onError])

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return
    try {
      setTranscript('')
      setError(null)

      // 1. Request microphone stream from browser/OS to ensure mic access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          mediaStreamRef.current = stream
        } catch (mediaErr) {
          console.warn('Microphone permission denied or device not found:', mediaErr)
          setError('not-allowed')
          if (onError) onError('not-allowed')
          return
        }
      }

      // 2. Start Web Speech Recognition
      recognitionRef.current.start()
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setError(err.message || 'failed_to_start')
      if (onError) onError(err.message || 'failed_to_start')
    }
  }, [isListening, onError])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return
    try {
      recognitionRef.current.stop()
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }
    } catch (err) {
      console.error('Failed to stop speech recognition:', err)
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  }
}

export default useSpeechToText
