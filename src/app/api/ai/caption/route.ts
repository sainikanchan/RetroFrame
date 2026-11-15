import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, AI_MODEL, parseDataUrl, extractJson, handleAiError } from "@/lib/ai/anthropic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl, mood } = await req.json();
    if (!imageDataUrl) {
      return NextResponse.json({ error: "imageDataUrl is required" }, { status: 400 });
    }
    const { mediaType, data } = parseDataUrl(imageDataUrl);
    const anthropic = getAnthropicClient();

    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif", data } },
            {
              type: "text",
              text: `You are writing short handwritten-style captions for a Polaroid photo, in the voice of the person who took it. Look at the photo and write 5 short caption options (max 8 words each)${
                mood ? `, matching this mood/tone: "${mood}"` : ""
              }. Respond ONLY with a JSON array of 5 strings, nothing else.`,
            },
          ],
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "[]";
    const captions = extractJson<string[]>(text);
    return NextResponse.json({ captions });
  } catch (err) {
    return handleAiError(err);
  }
}
