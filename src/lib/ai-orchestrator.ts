import { Client, Functions } from "node-appwrite";
import type { AiOutcome } from "@/lib/ai-types";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Add it to .env.local — see README for setup steps.`);
  }
  return value;
}

function getFunctionsClient() {
  const client = new Client()
    .setEndpoint(getEnv("APPWRITE_ENDPOINT"))
    .setProject(getEnv("APPWRITE_PROJECT_ID"))
    .setKey(getEnv("APPWRITE_API_KEY"));
  return new Functions(client);
}

// Calls the same `ai_orchestrator` Appwrite Function the companion Flutter
// app uses. That function normally reads its caller's identity from an
// `x-appwrite-user-id` header, auto-populated by Appwrite only for calls
// made with a real end-user session (the Flutter app's client SDK) —
// Appwrite's execution API rejects any caller-supplied header starting
// with "x-appwrite-" (confirmed: it 500s with "Invalid headers ... cannot
// start with x-appwrite"), so a server API-key call like this one cannot
// set that header itself. Instead this app's own already-verified NextAuth
// user id is sent as `callerId` in the body — the function (updated to
// match) uses it only as a fallback identity/cache key when no real
// session header is present, never as an override.
export async function callAiOrchestrator<T>(
  userId: string,
  feature: string,
  input: unknown
): Promise<AiOutcome<T>> {
  let execution;
  try {
    const functions = getFunctionsClient();
    execution = await functions.createExecution({
      functionId: "ai_orchestrator",
      body: JSON.stringify({ feature, input, callerId: userId }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, kind: "network", message: `Could not reach the AI service: ${message}` };
  }

  let parsed: Record<string, unknown> = {};
  try {
    parsed = execution.responseBody ? JSON.parse(execution.responseBody) : {};
  } catch {
    return { ok: false, kind: "failed", message: "The AI service returned an unreadable response." };
  }

  const status = execution.responseStatusCode;
  const errorText = typeof parsed.error === "string" ? parsed.error : null;

  if (status >= 400 || errorText) {
    if (status === 429 || errorText?.toLowerCase().includes("rate limit")) {
      return { ok: false, kind: "rate_limit", message: "AI rate limit reached. Try again in a bit." };
    }
    if (status === 503) {
      return { ok: false, kind: "unavailable", message: "Gemini is temporarily unavailable. Try again in a moment." };
    }
    if (status === 500 && errorText?.toLowerCase().includes("not configured")) {
      return {
        ok: false,
        kind: "missing_key",
        message: "AI isn't configured on the server yet (the Gemini API key is missing on the Appwrite Function).",
      };
    }
    if (status === 401) {
      return {
        ok: false,
        kind: "failed",
        message:
          "Not authorized to call the AI service — the server's Appwrite API key likely needs the Functions \"Execute\" scope added in the Appwrite Console.",
      };
    }
    return { ok: false, kind: "failed", message: errorText || "The AI request failed. Please try again." };
  }

  return { ok: true, data: parsed as T };
}
