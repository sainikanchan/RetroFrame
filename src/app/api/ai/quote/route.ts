import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, AI_MODEL, extractJson, handleAiError } from "@/lib/ai/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { theme } = await req.json();
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Write 5 short, original quotes suitable for a Polaroid scrapbook caption, about: "${
            theme || "memories and nostalgia"
          }". Each under 12 words, no attribution, no quotation marks. Respond ONLY with a JSON array of 5 strings.`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "[]";
    const quotes = extractJson<string[]>(text);
    return NextResponse.json({ quotes });
  } catch (err) {
    return handleAiError(err);
  }
}
