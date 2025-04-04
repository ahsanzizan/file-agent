import { ChatResponse, Message, Ollama } from "ollama";
import { MODEL_NAME } from "./constants";
import { FileManager } from "./file-manager";
import { logger } from "./logger";
import { FUNCTIONS } from "./tools-registry";

const ollama = new Ollama();
const fileManager = new FileManager();

let conversationHistory: Message[] = [
  {
    role: "system",
    content: `You are an AI assistant that helps users manage their local files when specifically requested.

You have two main modes of operation:
1. CHAT MODE: For general conversation, greetings, questions, or any messages that don't explicitly request file operations. In this mode, simply respond conversationally without using any tools.

2. FILE MANAGEMENT MODE: Only use the provided file system functions when the user explicitly asks you to perform file operations like creating, reading, listing, or modifying files or directories.

Examples:
- If user says "Hello" or "How are you?" → Just chat normally, don't use tools
- If user says "Create a file called notes.txt" → Use the appropriate file system tool
- If user asks "What time is it?" → Just answer conversationally, don't use tools
- If user asks "What files are in my downloads folder?" → Use the list files tool

Always prioritize natural conversation unless the user clearly requests file operations.

      Only use the provided functions to interact with the file system. Maintain a friendly, helpful tone when chatting with the user.`,
  },
];

export const chatWithAI = async (userMessage: string): Promise<string> => {
  try {
    logger.logInfo(`User message: ${userMessage}`);

    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: userMessage });

    // Process conversation in multiple turns to handle dependencies
    let finalResponse = null;
    let hasMoreActions = true;
    let iterations = 0;
    const MAX_ITERATIONS = 5; // Safety limit

    while (hasMoreActions && iterations < MAX_ITERATIONS) {
      iterations++;
      logger.logInfo(`Starting iteration ${iterations}`);

      const response: ChatResponse = await ollama.chat({
        model: MODEL_NAME,
        stream: false,
        messages: conversationHistory,
        tools: FUNCTIONS,
      });

      logger.logInfo(`Ollama Response: ${JSON.stringify(response, null, 2)}`);

      // Add AI response to history
      conversationHistory.push(response.message);

      if (
        response.message?.tool_calls &&
        response.message.tool_calls.length > 0
      ) {
        // Execute each tool call and capture results
        const toolResults = [];

        for (const toolCall of response.message.tool_calls) {
          const { name, arguments: args } = toolCall.function;
          const toolCallId: string =
            toolCall.function.name + "_" + toolResults.length;

          if (typeof fileManager[name as keyof FileManager] === "function") {
            try {
              const result = await (
                fileManager[name as keyof FileManager] as any
              )(...Object.values(args));

              logger.logInfo(`Executed '${name}': ${JSON.stringify(result)}`);
              toolResults.push({
                tool_call_id: toolCallId,
                role: "tool",
                name,
                content: JSON.stringify(result),
              });
            } catch (error) {
              logger.logError(`Error executing '${name}'`, error as Error);
              toolResults.push({
                tool_call_id: toolCallId,
                role: "tool",
                name,
                content: JSON.stringify({ error: (error as Error).message }),
              });
            }
          } else {
            logger.logWarning(`Unknown function call: '${name}'`);
            toolResults.push({
              tool_call_id: toolCallId,
              role: "tool",
              name,
              content: JSON.stringify({ error: "Unknown function" }),
            });
          }
        }

        // Add tool results to the conversation history
        conversationHistory.push(...toolResults);

        // Continue the conversation to let the AI decide what to do next
        const followUpResponse = await ollama.chat({
          model: MODEL_NAME,
          stream: false,
          messages: conversationHistory,
          tools: FUNCTIONS,
        });

        conversationHistory.push(followUpResponse.message);

        // Check if the AI has more actions or if it's done
        hasMoreActions =
          (followUpResponse.message?.tool_calls?.length || 0) > 0;

        // Store the final response if we're done with actions
        if (!hasMoreActions) {
          finalResponse = followUpResponse;
        }
      } else {
        // No tool calls, just a direct response
        finalResponse = response;
        hasMoreActions = false;
      }
    }

    // Return final response to the user
    if (finalResponse && finalResponse.message) {
      return finalResponse.message.content as string;
    } else if (iterations >= MAX_ITERATIONS) {
      logger.logWarning(
        `Reached maximum iterations (${MAX_ITERATIONS}). Stopping.`
      );
      return "I had to stop processing because the request required too many steps. Could you try a simpler request?";
    }

    return "I'm not sure how to respond to that.";
  } catch (error) {
    logger.logError("Error in chat interaction", error as Error);
    return `Sorry, I encountered an error: ${(error as Error).message}`;
  }
};

export const resetConversation = (): void => {
  conversationHistory = [
    {
      role: "system",
      content:
        "You are an AI that manages local files. Only use the provided functions to interact with the file system. Maintain a friendly, helpful tone when chatting with the user.",
    },
  ];
  logger.logInfo("Conversation history reset");
};
