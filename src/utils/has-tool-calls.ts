import { Message } from "ollama";

/**
 * Checks if a message contains tool calls
 * @param message - The message to check
 * @returns True if the message has tool calls, false otherwise
 */
export const hasToolCalls = (message: Message): boolean => {
  return Boolean(message?.tool_calls && message.tool_calls.length > 0);
};
