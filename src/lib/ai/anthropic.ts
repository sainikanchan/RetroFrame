import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("MISSING_API_KEY");
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const AI_MODEL = "claude-sonnet-4-6";

/** Splits a data URL like "data:image/png;base64,AAAA" into media type + base64 payload. */
export function parseDataUrl(dataUrl: string): { mediaType: string; data: string } {
  const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("INVALID_IMAGE_DATA_URL");
  return { mediaType: match[1] === "image/jpg" ? "image/jpeg" : match[1], data: match[2] };
}

/** Extracts the first JSON array/object found in a model text response. */
export function extractJson<T>(text: string): T {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned) as T;
}

export function handleAiError(err: unknown): Response {
  if (err instanceof Error && err.message === "MISSING_API_KEY") {
    return Response.json(
      { error: "AI features need an ANTHROPIC_API_KEY set in your environment. See README for setup." },
      { status: 501 }
    );
  }
  console.error(err);
  return Response.json({ error: "AI request failed. Please try again." }, { status: 500 });
}
