import { handleAIRequest } from "./ai-handler";

async function main() {
  const prompt = "List all files in the current directory";
  await handleAIRequest(prompt);
}

main();
