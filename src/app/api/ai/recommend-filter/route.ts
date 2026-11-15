import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, AI_MODEL, parseDataUrl, extractJson, handleAiError } from "@/lib/ai/anthropic";
import { FILTERS } from "@/lib/constants";

export const runtime = "nodejs";

interface Recommendation {
  filter: string;
  reason: string;
  adjustments: { brightness: number; contrast: number; saturation: number; temperature: number; vignette: number };
}

export async function POST(req: NextRequest) {
  try {
    const { imageDataUrl } = await req.json();
    if (!imageDataUrl) return NextResponse.json({ error: "imageDataUrl is required" }, { status: 400 });
    const { mediaType, data } = parseDataUrl(imageDataUrl);
    const anthropic = getAnthropicClient();
    const filterIds = FILTERS.map((f) => f.id).join(", ");

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
              text: `Look at this photo and recommend the single best Polaroid filter from this exact list: [${filterIds}]. Also suggest adjustment values (brightness, contrast, saturation, temperature, vignette, each -100 to 100) that would complement the photo. Respond ONLY with JSON: {"filter": "<id from list>", "reason": "<one short sentence>", "adjustments": {"brightness": n, "contrast": n, "saturation": n, "temperature": n, "vignette": n}}`,
            },
          ],
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
    const recommendation = extractJson<Recommendation>(text);
    return NextResponse.json({ recommendation });
  } catch (err) {
    return handleAiError(err);
  }
}
