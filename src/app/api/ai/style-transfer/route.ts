import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, AI_MODEL, parseDataUrl, extractJson, handleAiError } from "@/lib/ai/anthropic";
import { FILTERS, FRAME_TEMPLATES } from "@/lib/constants";

export const runtime = "nodejs";

interface StyleResult {
  filter: string;
  frameTemplate: string;
  adjustments: { brightness: number; contrast: number; saturation: number; temperature: number; vignette: number; blur: number };
  caption: string;
}

// Note: this endpoint uses Claude's vision + reasoning to choose the closest
// combination of RetroFrame's own filters/frame/adjustments to match a style
// prompt (e.g. "90s film photo"). It does not regenerate pixels with an
// image-generation model — true pixel-level style transfer would need an
// image model such as Replicate/fal.ai/Gemini image, wired up the same way
// as the /colorize route below once you add that provider's API key.
export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl, prompt } = await req.json();
    if (!imageDataUrl || !prompt) {
      return NextResponse.json({ error: "imageDataUrl and prompt are required" }, { status: 400 });
    }
    const { mediaType, data } = parseDataUrl(imageDataUrl);
    const anthropic = getAnthropicClient();
    const filterIds = FILTERS.map((f) => f.id).join(", ");
    const frameIds = FRAME_TEMPLATES.map((f) => f.id).join(", ");

    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif", data } },
            {
              type: "text",
              text: `A user wants this photo to look like: "${prompt}". Pick the closest filter from [${filterIds}] and frame from [${frameIds}] in RetroFrame's library, plus adjustment values (brightness, contrast, saturation, temperature, vignette, blur — each -100 to 100, blur 0-100) to best achieve that look, and write one short caption (max 8 words) fitting the vibe. Respond ONLY with JSON: {"filter": "id", "frameTemplate": "id", "adjustments": {"brightness": n, "contrast": n, "saturation": n, "temperature": n, "vignette": n, "blur": n}, "caption": "text"}`,
            },
          ],
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
    const result = extractJson<StyleResult>(text);
    return NextResponse.json({ result });
  } catch (err) {
    return handleAiError(err);
  }
}
