import { ChatResponse, Message } from "ollama";
import { DEFAULT_SYSTEM_PROMPT, MAX_ITERATIONS } from "./constants";
import { logger } from "./logger";
import { addMessageToHistory } from "./utils/add-message-to-history";
import { executeToolsAndContinueConversation } from "./utils/execute-tools-and-continue";
import { getAIResponse } from "./utils/get-ai-response";
import { hasToolCalls } from "./utils/has-tool-calls";

/**
 * Conversation state
 */
let conversationHistory: Message[] = initializeConversationHistory();

/**
 * Initializes conversation history with the system prompt
 * @returns An array containing the system message
 */
function initializeConversationHistory(): Message[] {
  return [
    {
      role: "system",
      content: DEFAULT_SYSTEM_PROMPT,
    },
  ];
}

/**
 * Processes a user message and generates an AI response, potentially executing file operations
 * @param userMessage - The message from the user
 * @returns A string containing the AI's response
 */
export const chatWithAI = async (userMessage: string): Promise<string> => {
  try {
    logger.logInfo(`Processing user message: ${userMessage}`);
    addMessageToHistory(conversationHistory, "user", userMessage);

    // Process multi-turn conversation to handle tool dependencies
    const result = await processMultiTurnConversation();

    if (result.success) {
      return result.response!;
    } else {
      return result.error || "I'm not sure how to respond to that.";
    }
  } catch (error) {
    logger.logError("Error in chat interaction", error as Error);
    return `Sorry, I encountered an error: ${(error as Error).message}`;
  }
};

/**
 * Processes the conversation through multiple turns until completion or max iterations
 * @returns Object containing success status and either response or error message
 */
async function processMultiTurnConversation(): Promise<{
  success: boolean;
  response?: string;
  error?: string;
}> {
  let finalResponse: ChatResponse | null = null;
  let hasMoreActions = true;
  let iterations = 0;

  while (hasMoreActions && iterations < MAX_ITERATIONS) {
    iterations++;
    logger.logInfo(`Starting iteration ${iterations} of ${MAX_ITERATIONS}`);

    // Get AI response based on conversation history
    const response = await getAIResponse(conversationHistory);
    addMessageToHistory(conversationHistory, "assistant", response.message);

    // Check if the AI wants to use tools
    if (hasToolCalls(response.message)) {
      // Execute tools and process results
      const hasMoreTools = await executeToolsAndContinueConversation(
        conversationHistory,
        response.message.tool_calls || []
      );
      hasMoreActions = hasMoreTools;

      if (!hasMoreTools) {
        // If no more tools needed, get final response
        finalResponse = await getAIResponse(conversationHistory);
        addMessageToHistory(
          conversationHistory,
          "assistant",
          finalResponse.message
        );
      }
    } else {
      // No tool calls, direct response to user
      finalResponse = response;
      hasMoreActions = false;
    }
  }

  // Return appropriate response based on outcome
  if (finalResponse?.message) {
    return { success: true, response: finalResponse.message.content as string };
  } else if (iterations >= MAX_ITERATIONS) {
    logger.logWarning(
      `Reached maximum iterations (${MAX_ITERATIONS}). Stopping.`
    );
    return {
      success: false,
      error:
        "I had to stop processing because the request required too many steps. Could you try a simpler request?",
    };
  }

  return { success: false, error: "Failed to generate a response." };
}

/**
 * Resets the conversation history to its initial state
 */
export const resetConversation = (): void => {
  conversationHistory = initializeConversationHistory();
  logger.logInfo("Conversation history has been reset");
};
