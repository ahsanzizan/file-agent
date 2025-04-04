import { Message } from "ollama";

/**
 * Adds a message to the conversation history
 * @param role - The role of the message sender ("user", "assistant", "system", "tool")
 * @param message - The message or Message object to add
 */
export const addMessageToHistory = (
  conversationHistory: Message[],
  role: string,
  message: string | Message
): void => {
  if (typeof message === "string") {
    conversationHistory.push({ role, content: message });
  } else {
    conversationHistory.push(message);
  }
};
