import { chatWithLLM, EV_SYSTEM_PROMPT } from './llm.js'
import { mcpManager } from '../mcp/mcpManager.js'

/**
 * Main Autonomous Agent function.
 * Given a user command/prompt, queries NVIDIA Nemotron with MCP tools,
 * executes any tool calls requested by Nemotron over MCP stdio servers,
 * and returns the final assistant response.
 *
 * @param {string} userPrompt - User input command
 * @returns {Promise<{ success: boolean, message: string, intent?: string, appName?: string }>}
 */
export async function runAgent(userPrompt) {
  if (!userPrompt || typeof userPrompt !== 'string') {
    return { success: false, message: 'Invalid prompt provided.' }
  }

  try {
    console.log(`[STEP 2: AGENT INITIALIZING] -> Fetching MCP tools list from MCP Manager...`)
    await mcpManager.initialize()
    const tools = mcpManager.getToolDefinitions()

    console.log(`[STEP 2: AGENT INITIALIZING] -> ${tools.length} total MCP tool schemas attached to prompt.`)

    const messages = [
      { role: 'system', content: EV_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ]

    const MAX_TOOL_ITERATIONS = 5
    let iterations = 0

    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++

      // Force tool execution on Iteration 1 when tools are present
      const toolChoice = (iterations === 1 && tools && tools.length > 0) ? 'required' : 'auto'

      console.log(`\n--- Agent Loop Iteration ${iterations} (tool_choice: ${toolChoice}) ---`)
      const responseMessage = await chatWithLLM(messages, tools, toolChoice)

      messages.push(responseMessage)

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        console.log(`\n[STEP 4: NEMOTRON LLM DECISION] -> Nemotron requested ${responseMessage.tool_calls.length} tool call(s):`)
        responseMessage.tool_calls.forEach((tc, idx) => {
          console.log(`   Tool #${idx + 1}: "${tc.function?.name}" with args: ${tc.function?.arguments}`)
        })

        for (const toolCall of responseMessage.tool_calls) {
          const fnName = toolCall.function?.name
          let fnArgs = {}

          try {
            if (typeof toolCall.function?.arguments === 'string') {
              fnArgs = JSON.parse(toolCall.function.arguments)
            } else if (typeof toolCall.function?.arguments === 'object') {
              fnArgs = toolCall.function.arguments
            }
          } catch (e) {
            console.warn(`[Agent] Failed to parse args for tool ${fnName}:`, e)
          }

          console.log(`\n[STEP 5: EXECUTING TOOL VIA MCP CLIENT] -> Calling "${fnName}"...`)
          let toolOutput = ''
          try {
            toolOutput = await mcpManager.callTool(fnName, fnArgs)
            console.log(`[STEP 5 RESULT] -> Tool "${fnName}" output:`, toolOutput.length > 150 ? toolOutput.substring(0, 150) + '...' : toolOutput)
          } catch (toolError) {
            toolOutput = `Error executing tool ${fnName}: ${toolError.message}`
            console.error(`[STEP 5 ERROR] -> Tool "${fnName}" failed:`, toolError.message)
          }

          console.log(`[STEP 6: FEEDING TOOL RESULT BACK TO NEMOTRON] -> Appending output for "${fnName}" into conversation.`)
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: fnName,
            content: typeof toolOutput === 'string' ? toolOutput : JSON.stringify(toolOutput)
          })
        }

        continue
      }

      const finalContent = responseMessage.content || "Task completed successfully."
      console.log(`\n[STEP 6: NEMOTRON FINAL ANSWER GENERATED] -> Nemotron completed reasoning.`)
      return {
        success: true,
        message: finalContent.trim(),
        command: userPrompt
      }
    }

    const lastMsg = messages[messages.length - 1]
    return {
      success: true,
      message: lastMsg?.content || 'Done.',
      command: userPrompt
    }
  } catch (err) {
    console.error('[Agent] Execution error:', err)
    return {
      success: false,
      message: `I encountered an issue processing that: ${err.message}`,
      command: userPrompt
    }
  }
}
