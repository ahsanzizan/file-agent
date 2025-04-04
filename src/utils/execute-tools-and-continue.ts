import { Message, ToolCall } from "ollama";
import { FileManager, fileManager } from "../file-manager";
import { logger } from "../logger";
import { addMessageToHistory } from "./add-message-to-history";
import { getAIResponse } from "./get-ai-response";
import { hasToolCalls } from "./has-tool-calls";

/**
 * Executes a single tool call and formats the result
 * @param name - The name of the tool to execute
 * @param args - The arguments for the tool
 * @param toolCallId - The unique ID for this tool call
 * @returns The formatted result of the tool execution
 */
export const executeToolCall = async (
  name: string,
  args: { [key: string]: any },
  toolCallId: string
): Promise<any> => {
  if (typeof fileManager[name as keyof FileManager] === "function") {
    try {
      const result = await (fileManager[name as keyof FileManager] as any)(
        ...Object.values(args)
      );
      logger.logInfo(`Executed tool '${name}' successfully`);

      return {
        tool_call_id: toolCallId,
        role: "tool",
        name,
        content: JSON.stringify(result),
      };
    } catch (error) {
      logger.logError(`Error executing tool '${name}'`, error as Error);

      return {
        tool_call_id: toolCallId,
        role: "tool",
        name,
        content: JSON.stringify({ error: (error as Error).message }),
      };
    }
  } else {
    logger.logWarning(`Unknown function call: '${name}'`);

    return {
      tool_call_id: toolCallId,
      role: "tool",
      name,
      content: JSON.stringify({ error: "Unknown function" }),
    };
  }
};

/**
 * Executes tool calls and adds their results to the conversation history
 * @param toolCalls - The tool calls to execute
 * @returns Boolean indicating if the AI has more tool calls to make
 */
export const executeToolsAndContinueConversation = async (
  conversationHistory: Message[],
  toolCalls: ToolCall[]
): Promise<boolean> => {
  // Execute each tool call and capture results
  const toolResults = [];

  for (const toolCall of toolCalls) {
    const { name, arguments: args } = toolCall.function;
    const toolCallId = `${name}_${toolResults.length}`;
    const toolResult = await executeToolCall(name, args, toolCallId);
    toolResults.push(toolResult);
  }

  // Add tool results to the conversation history
  toolResults.forEach((result) =>
    addMessageToHistory(conversationHistory, result.role, result)
  );

  // Continue the conversation to let the AI decide what to do next
  const followUpResponse = await getAIResponse(conversationHistory);
  addMessageToHistory(
    conversationHistory,
    "assistant",
    followUpResponse.message
  );

  // Check if the AI has more actions to perform
  return hasToolCalls(followUpResponse.message);
};
