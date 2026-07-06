// One-off diagnostic (not part of the app) — verifies this app's own
// APPWRITE_API_KEY (from .env.local) can execute the ai_orchestrator
// function, exactly the way src/lib/ai-orchestrator.ts does. Safe to
// delete after use.
import { config } from "dotenv";
import { Client, Functions } from "node-appwrite";

config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const functions = new Functions(client);

const execution = await functions.createExecution({
  functionId: "ai_orchestrator",
  body: JSON.stringify({
    feature: "improveDescription",
    input: { currentDescription: "Built a Next.js dashboard that shows portfolio stats." },
    callerId: "diagnostic-script-user",
  }),
});

console.log("status:", execution.status);
console.log("responseStatusCode:", execution.responseStatusCode);
console.log("responseBody:", execution.responseBody);
