/**
 * Text-to-Speech (TTS) engine for EV assistant.
 * Configured with Spider-Man Suit AI ("Karen") acoustic profile tuning.
 */

let selectedVoice = null
let speechListeners = []

export function subscribeSpeechState(callback) {
  if (typeof callback === 'function') {
    speechListeners.push(callback)
  }
  return () => {
    speechListeners = speechListeners.filter((cb) => cb !== callback)
  }
}

function notifySpeechState(isSpeaking) {
  speechListeners.forEach((cb) => {
    try {
      cb(isSpeaking)
    } catch (e) {
      console.error('Speech state callback error:', e)
    }
  })
}

export function getAvailableVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return []
  const allVoices = window.speechSynthesis.getVoices()
  const englishVoices = allVoices.filter((v) => v.lang.startsWith('en') || v.lang.startsWith('EN'))
  return englishVoices.length > 0 ? englishVoices : allVoices
}

export function setSelectedVoice(voiceObj) {
  if (voiceObj) {
    selectedVoice = voiceObj
    console.log('Selected EV voice:', voiceObj.name)
  }
}

export function previewVoiceByObj(voiceObj) {
  if (!voiceObj) return
  selectedVoice = voiceObj
  const cleanName = voiceObj.name
    .replace(/^Microsoft\s*/i, '')
    .replace(/\s*Desktop/i, '')
    .replace(/\s*-\s*English.*/i, '')

  speak(`Hello! Testing ${cleanName} voice. Suit AI active.`)
}

function initVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  const updateVoice = () => {
    const voices = getAvailableVoices()
    if (!voices || voices.length === 0) return

    // Auto-select Microsoft Zira (Female) as default
    if (!selectedVoice) {
      selectedVoice =
        voices.find((v) => v.name.toLowerCase().includes('zira')) ||
        voices.find((v) => v.name.toLowerCase().includes('female')) ||
        voices[0]
    }
  }

  updateVoice()
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoice
  }
}

initVoice()

if (typeof window !== 'undefined') {
  window.getAvailableVoices = getAvailableVoices
}

/**
 * Speaks text aloud using Text-to-Speech synthesis with Suit AI ("Karen") acoustics.
 * @param {string} text - The message text to speak aloud
 * @param {object} options - Optional pitch, rate, and volume parameters
 */
export function speak(text, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment.')
    return
  }

  if (!text || typeof text !== 'string') return

  try {
    stopSpeech()

    const cleanText = text
      .replace(/[*_~#`]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)

    utterance.rate = options.rate || 1.1
    utterance.pitch = options.pitch || 1.22
    utterance.volume = options.volume || 1.0

    if (selectedVoice) {
      utterance.voice = selectedVoice
    } else {
      const voices = getAvailableVoices()
      if (voices && voices.length > 0) {
        utterance.voice = voices.find((v) => v.name.toLowerCase().includes('zira')) || voices[0]
      }
    }

    utterance.onstart = () => {
      notifySpeechState(true)
    }

    utterance.onend = () => {
      notifySpeechState(false)
    }

    utterance.onerror = () => {
      notifySpeechState(false)
    }

    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.error('Failed to execute Text-to-Speech:', err)
    notifySpeechState(false)
  }
}

/**
 * Stops active speech synthesis immediately.
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  notifySpeechState(false)
}

export default speak
