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
    'nvidia/nemotron-3.5-lightning-30b-a3b',
    'mistralai/mistral-nemotron'
  ]
  return candidates.filter((m, index, self) => m && self.indexOf(m) === index)
}

export function getGroqModels() {
  const envModel = readEnvKey('GROQ_MODEL')
  const candidates = [
    envModel,
    'qwen/qwen3.8-27b'
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
 * Sends messages & tool definitions to AI LLM providers (NVIDIA Nemotron / Groq).
 */
export async function chatWithLLM(messages, tools = null, toolChoice = 'auto') {
  const groqApiKey = getGroqApiKey()
  const nvidiaApiKey = getNvidiaApiKey()

  // First try Groq if key is present (Groq delivers ultra-fast sub-second ~500ms responses)
  if (groqApiKey) {
    const groqClient = new OpenAI({
      apiKey: groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      timeout: 7000
    })

    const groqModels = getGroqModels()
    for (const modelName of groqModels) {
      try {
        const startTime = Date.now()
        console.log(`[STEP 3: QUERYING FAST GROQ LLM] -> Model: ${modelName} | Messages: ${messages.length} | Tools: ${tools ? tools.length : 0} | ToolChoice: ${toolChoice}`)

        const groqParams = {
          model: modelName,
          messages,
          temperature: 0.2,
          max_tokens: 500
        }

        if (tools && Array.isArray(tools) && tools.length > 0) {
          groqParams.tools = tools
          groqParams.tool_choice = toolChoice
        }

        const completion = await groqClient.chat.completions.create(groqParams)
        const duration = Date.now() - startTime
        const choice = completion.choices?.[0]

        if (choice?.message) {
          console.log(`[STEP 3 SUCCESS] -> Groq (${modelName}) payload received in ${duration}ms.`)
          return choice.message
        }
      } catch (err) {
        console.warn(`[STEP 3 WARN] -> Groq (${modelName}) request failed: ${err.message}`)
      }
    }
  }

  // Fallback or primary NVIDIA Nemotron API call
  if (nvidiaApiKey) {
    const nvidiaClient = new OpenAI({
      apiKey: nvidiaApiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
      timeout: 7000
    })

    const modelsToTry = getNemotronModels()

    for (const modelName of modelsToTry) {
      try {
        const startTime = Date.now()
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
        const duration = Date.now() - startTime
        const choice = completion.choices?.[0]

        if (choice?.message) {
          console.log(`[STEP 3 SUCCESS] -> NVIDIA Nemotron (${modelName}) payload received in ${duration}ms.`)
          return choice.message
        }
      } catch (err) {
        console.warn(`[STEP 3 WARN] -> NVIDIA Nemotron (${modelName}) request failed: ${err.message}`)
      }
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
