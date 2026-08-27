import fs from 'fs'
import path from 'path'

function getApiKey() {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    return process.env.GROQ_API_KEY.trim()
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
    return process.env.OPENAI_API_KEY.trim()
  }

  try {
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const match = content.match(/GROQ_API_KEY\s*=\s*(.+)/)
      if (match && match[1]) {
        const key = match[1].trim()
        if (key && !key.includes('YOUR_')) return key
      }
    }
  } catch (err) {
    console.warn('Failed to parse .env file:', err)
  }

  return ''
}

/**
 * Speech-to-Text transcriber using Whisper API with free fallback.
 */
export async function transcribeAudio(audioBuffer, mimeType = 'audio/webm', apiKey = '') {
  const activeKey = apiKey || getApiKey()

  if (activeKey) {
    try {
      const blob = new Blob([audioBuffer], { type: mimeType })
      const formData = new FormData()
      formData.append('file', blob, 'recording.webm')
      formData.append('model', 'whisper-large-v3-turbo')

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeKey}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.text && data.text.trim()) {
          console.log('Whisper STT transcribed:', data.text.trim())
          return data.text.trim()
        }
      }
    } catch (error) {
      console.warn('STT API fetch error:', error)
    }
  }

  return transcribeWithFreeService(audioBuffer, mimeType)
}

async function transcribeWithFreeService(audioBuffer, mimeType) {
  try {
    const blob = new Blob([audioBuffer], { type: mimeType })

    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-tiny',
      {
        method: 'POST',
        headers: {
          'Content-Type': mimeType
        },
        body: blob
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data && data.text && data.text.trim()) {
        return data.text.trim()
      }
    }
  } catch (err) {
    console.warn('Free Whisper fallback notice:', err)
  }

  throw new Error('Speech not recognized. Please speak clearly into your microphone.')
}
