import { chatWithAI, resetConversation } from "./ai-handler";
import { logger } from "./logger";

async function main() {
  const readline = require("readline");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(
    "File Management Assistant ready. Type 'exit' to quit or 'reset' to start a new conversation."
  );

  const promptUser = () => {
    rl.question("You: ", async (input: string) => {
      if (input.toLowerCase() === "exit") {
        logger.logInfo(`User exited`);

        rl.close();
        return;
      }

      if (input.toLowerCase() === "reset") {
        logger.logInfo(`User reset`);

        resetConversation();
        console.log("Conversation has been reset.");
        promptUser();
        return;
      }

      const response = await chatWithAI(input);
      console.log(`AI: ${response}`);
      promptUser();
    });
  };

  promptUser();
}

main();
