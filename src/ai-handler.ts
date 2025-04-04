import { Ollama, ChatResponse } from "ollama";
import { FileManager } from "./file-manager";
import { FUNCTIONS } from "./tools-registry";
import { logger } from "./logger";

const ollama = new Ollama();
const fileManager = new FileManager();

export async function handleAIRequest(prompt: string) {
  logger.logInfo(`AI Request: ${prompt}`);

  try {
    const response: ChatResponse = await ollama.chat({
      model: "gemma3:4b",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that manages local files. Only use the provided functions to interact with the file system.",
        },
        { role: "user", content: prompt },
      ],
      tools: FUNCTIONS,
    });

    logger.logInfo(`Ollama Response: ${JSON.stringify(response, null, 2)}`);

    if (response.message?.tool_calls) {
      for (const toolCall of response.message.tool_calls) {
        const { name, arguments: args } = toolCall.function;

        if (typeof fileManager[name as keyof FileManager] === "function") {
          try {
            const result = await (
              fileManager[name as keyof FileManager] as any
            )(...Object.values(args));
            logger.logInfo(`Executed '${name}': ${JSON.stringify(result)}`);
          } catch (error) {
            logger.logError(`Error executing '${name}'`, error as Error);
          }
        } else {
          logger.logWarning(`Unknown function call: '${name}'`);
        }
      }
    } else {
      logger.logInfo(`AI Response: ${response.message.content}`);
    }
  } catch (error) {
    logger.logError("Error handling AI request", error as Error);
  }
}
