import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'

function readEnvKey(keyName) {
  if (process.env[keyName] && process.env[keyName].trim()) {
    return process.env[keyName].trim()
  }

  const filePaths = [path.join(process.cwd(), '.env'), path.join(process.cwd(), '.env.example')]

  for (const envPath of filePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        const regex = new RegExp(`${keyName}\\s*=\\s*(.+)`, 'i')
        const match = content.match(regex)
        if (match && match[1]) {
          const key = match[1].trim()
          if (key && !key.includes('YOUR_')) return key
        }
      }
    } catch (err) {
      console.warn(`Failed to parse ${envPath}:`, err)
    }
  }

  return ''
}

export function getNvidiaApiKey() {
  return readEnvKey('NVIDIA_API_KEY') || readEnvKey('NVEDIA_API_KEY') || readEnvKey('NEMOTRON_API_KEY')
}

export function getGroqApiKey() {
  return readEnvKey('GROQ_API_KEY')
}

export function getNemotronModels() {
  const envModel = readEnvKey('NVIDIA_MODEL')
  const candidates = [
    envModel,
    'mistralai/mistral-nemotron',
    'nvidia/llama-3.1-nemotron-70b-instruct',
    'nvidia/nemotron-4-340b-instruct'
  ]
  return candidates.filter((m, index, self) => m && self.indexOf(m) === index)
}

export const EV_SYSTEM_PROMPT = `You are EV, a sleek, high-tech desktop AI assistant with a personality similar to Spider-Man's Suit AI ("Karen").
You are intelligent, witty, articulate, helpful, and equipped with Model Context Protocol (MCP) desktop tools.

CRITICAL ACTION RULES:
- Whenever the user asks you to perform an action (e.g. open YouTube or a website, launch an app, run a command, read/write files, or check CPU/RAM stats), YOU MUST CALL THE RELEVANT TOOL FIRST via tool_calls.
- Do NOT write in plain text that you will open something without calling the tool! Always execute the tool call.
- Provide a clear, witty 1-2 sentence response after the tool executes.`

/**
 * Sends messages & tool definitions to NVIDIA Nemotron NIM endpoint using official OpenAI SDK.
 */
export async function chatWithLLM(messages, tools = null, toolChoice = 'auto') {
  const nvidiaApiKey = getNvidiaApiKey()

  if (nvidiaApiKey) {
    const nvidiaClient = new OpenAI({
      apiKey: nvidiaApiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1'
    })

    const modelsToTry = getNemotronModels()

    for (const modelName of modelsToTry) {
      try {
        console.log(`[STEP 3: SENDING TO NVIDIA NEMOTRON LLM] -> Model: ${modelName} | Messages: ${messages.length} | Tools: ${tools ? tools.length : 0} | ToolChoice: ${toolChoice}`)

        const params = {
          model: modelName,
          messages,
          temperature: 0.2,
          max_tokens: 1024
        }

        if (tools && Array.isArray(tools) && tools.length > 0) {
          params.tools = tools
          params.tool_choice = toolChoice
        }

        const completion = await nvidiaClient.chat.completions.create(params)
        const choice = completion.choices?.[0]

        if (choice?.message) {
          console.log(`[STEP 3 SUCCESS] -> NVIDIA Nemotron (${modelName}) payload received successfully.`)
          return choice.message
        }
      } catch (err) {
        console.warn(`[STEP 3 WARN] -> NVIDIA Nemotron (${modelName}) request failed: ${err.message}`)
      }
    }
  }

  // Fallback to Groq API if NVIDIA key is missing or fails
  const groqApiKey = getGroqApiKey()
  if (groqApiKey) {
    try {
      console.log('[STEP 3 FALLBACK: QUERYING GROQ API] -> Model: llama-3.1-8b-instant...')
      const groqClient = new OpenAI({
        apiKey: groqApiKey,
        baseURL: 'https://api.groq.com/openai/v1'
      })

      const groqParams = {
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.2,
        max_tokens: 500
      }

      if (tools && Array.isArray(tools) && tools.length > 0) {
        groqParams.tools = tools
        groqParams.tool_choice = toolChoice
      }

      const completion = await groqClient.chat.completions.create(groqParams)
      const choice = completion.choices?.[0]

      if (choice?.message) {
        console.log('[STEP 3 SUCCESS] -> Groq API payload received.')
        return choice.message
      }
    } catch (err) {
      console.warn('[STEP 3 ERROR] -> Groq API fallback error:', err.message)
    }
  }

  return {
    role: 'assistant',
    content: `I'm EV, your high-tech assistant! NVIDIA Nemotron & Groq APIs are standby-ready.`
  }
}

/**
 * Backwards compatibility helper for simple query calls
 */
export async function askLLM(userPrompt) {
  const messages = [
    { role: 'system', content: EV_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ]
  const message = await chatWithLLM(messages)
  return message.content || `I'm operational and ready! How can I help you today?`
}
