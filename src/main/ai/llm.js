import fs from 'fs'
import path from 'path'

function getApiKey() {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    return process.env.GROQ_API_KEY.trim()
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) {
    return process.env.OPENAI_API_KEY.trim()
  }

  // Check .env and .env.example
  const filePaths = [path.join(process.cwd(), '.env'), path.join(process.cwd(), '.env.example')]

  for (const envPath of filePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        const match = content.match(/GROQ_API_KEY\s*=\s*(gsk_[a-zA-Z0-9_-]+)/)
        if (match && match[1]) {
          const key = match[1].trim()
          if (key) return key
        }
      }
    } catch (err) {
      console.warn(`Failed to parse ${envPath}:`, err)
    }
  }

  return ''
}

const EV_SYSTEM_PROMPT = `You are EV, a sleek, high-tech desktop AI assistant with a personality similar to Spider-Man's Suit AI ("Karen"). 
You are intelligent, witty, articulate, and helpful. 
Provide clear, complete, and engaging answers in 2-3 full sentences. Never end mid-sentence.`

let cachedActiveModel = null

/**
 * Dynamically queries Groq API for currently active chat models.
 */
async function getActiveGroqModels(apiKey) {
  if (cachedActiveModel) return [cachedActiveModel]

  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    if (res.ok) {
      const data = await res.json()
      if (data && data.data && Array.isArray(data.data)) {
        const chatModels = data.data
          .map((m) => m.id)
          .filter(
            (id) =>
              !id.includes('whisper') &&
              !id.includes('safetensors') &&
              !id.includes('vision') &&
              !id.includes('safeguard') &&
              !id.includes('orpheus') &&
              !id.includes('guard')
          )

        console.log('Available Active Groq Chat Models:', chatModels)
        if (chatModels.length > 0) {
          cachedActiveModel = chatModels[0]
          return chatModels
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch active Groq models list:', err)
  }

  return [
    'llama-3.3-70b-specdec',
    'llama-3.1-8b-instant',
    'qwen-2.5-coder-32b',
    'deepseek-r1-distill-llama-70b'
  ]
}

/**
 * Sends a conversation prompt to the active Groq LLM model.
 * @param {string} userPrompt - The user's query or message
 * @returns {Promise<string>} The AI response
 */
export async function askLLM(userPrompt) {
  const apiKey = getApiKey()

  if (apiKey) {
    const modelsToTry = await getActiveGroqModels(apiKey)

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: EV_SYSTEM_PROMPT },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 350
          })
        })

        if (response.ok) {
          const data = await response.json()
          if (data?.choices?.[0]?.message?.content) {
            console.log(`Groq LLM Success (${modelName}):`, data.choices[0].message.content.trim())
            cachedActiveModel = modelName
            return data.choices[0].message.content.trim()
          }
        } else {
          const errText = await response.text()
          console.warn(`Groq LLM (${modelName}) error ${response.status}:`, errText)
        }
      } catch (err) {
        console.warn(`Groq LLM (${modelName}) fetch error:`, err)
      }
    }
  }

  return `I'm operational and ready! Ask me anything or tell me to launch applications.`
}
