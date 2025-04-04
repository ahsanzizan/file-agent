import { ChatResponse, Message, Ollama } from "ollama";
import { MODEL_NAME } from "../constants";
import { logger } from "../logger";
import { FUNCTIONS } from "../tools-registry";

const ollama = new Ollama();

/**
 * Gets a response from the AI model based on current conversation history
 * @returns The AI's response
 */
export const getAIResponse = async (
  conversationHistory: Message[]
): Promise<ChatResponse> => {
  const response = await ollama.chat({
    model: MODEL_NAME,
    stream: false,
    messages: conversationHistory,
    tools: FUNCTIONS,
  });

  logger.logInfo(
    `Received AI response (truncated): ${JSON.stringify(
      response.message?.content
    ).substring(0, 100)}...`
  );
  return response;
};
