import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Colorizing a black-and-white photo means regenerating pixels, which needs
// an image-generation/editing model — Claude itself is text+vision-in only
// and can't output image pixels. This route is wired for Replicate's
// colorization models; add REPLICATE_API_TOKEN to your environment to
// activate it. Swap the `model` below for any image-to-image colorizer you
// prefer (Replicate, fal.ai, Google's image models, etc.) — the request/
// response shape of this route can stay the same for the frontend.
export async function POST(req: NextRequest) {
  const { imageDataUrl } = await req.json();
  if (!imageDataUrl) {
    return NextResponse.json({ error: "imageDataUrl is required" }, { status: 400 });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Colorization needs an image-generation provider. Add REPLICATE_API_TOKEN to your environment to enable it — see README.md.",
      },
      { status: 501 }
    );
  }

  try {
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Example: piddnad/ddcolor colorization model. Pin a specific
        // version hash from https://replicate.com before shipping to prod.
        version: process.env.REPLICATE_COLORIZE_MODEL_VERSION,
        input: { image: imageDataUrl },
      }),
    });

    if (!prediction.ok) {
      const body = await prediction.text();
      return NextResponse.json({ error: `Replicate request failed: ${body}` }, { status: 502 });
    }

    const data = await prediction.json();
    return NextResponse.json({ prediction: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Colorize request failed. Please try again." }, { status: 500 });
  }
}
