"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Wand2, Quote, Palette } from "lucide-react";
import { toast } from "sonner";
import { FilterId, FrameTemplateId } from "@/types";

const STYLE_PRESETS = ["90s film photo", "vintage camera photo", "golden hour glow", "moody rainy day"];

async function callAi<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "AI request failed");
  return json;
}

export function AiPanel() {
  const project = useEditorStore((s) => s.project);
  const setCaption = useEditorStore((s) => s.setCaption);
  const setFilter = useEditorStore((s) => s.setFilter);
  const setFrame = useEditorStore((s) => s.setFrame);
  const setAdjustment = useEditorStore((s) => s.setAdjustment);
  const commit = useEditorStore((s) => s.commit);

  const [loading, setLoading] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [stylePrompt, setStylePrompt] = useState("");

  const needsImage = !project.imageSrc;

  const run = async (key: string, fn: () => Promise<void>) => {
    setLoading(key);
    try {
      await fn();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const applyAdjustments = (adj: Partial<Record<string, number>>) => {
    commit();
    Object.entries(adj).forEach(([k, v]) => {
      if (typeof v === "number") setAdjustment(k as never, v);
    });
  };

  return (
    <Tabs defaultValue="caption">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="caption">Captions</TabsTrigger>
        <TabsTrigger value="style">Style</TabsTrigger>
      </TabsList>

      <TabsContent value="caption" className="mt-4 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Button
            disabled={needsImage || loading === "caption"}
            onClick={() =>
              run("caption", async () => {
                const { captions } = await callAi<{ captions: string[] }>("/api/ai/caption", {
                  imageDataUrl: project.imageSrc,
                });
                setCaptions(captions);
              })
            }
          >
            <Sparkles className="size-4" /> {loading === "caption" ? "Looking at your photo…" : "Generate AI captions"}
          </Button>
          {needsImage && <p className="text-xs text-ink-soft">Upload a photo first.</p>}
          {captions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {captions.map((c, i) => (
                <button
                  key={i}
                  onClick={() => { commit(); setCaption({ text: c }); }}
                  className="rounded-md border border-line px-3 py-2 text-left text-sm hover:bg-paper-dim cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <Button
            variant="secondary"
            disabled={loading === "quote"}
            onClick={() =>
              run("quote", async () => {
                const { quotes } = await callAi<{ quotes: string[] }>("/api/ai/quote", { theme: project.caption.text });
                setQuotes(quotes);
              })
            }
          >
            <Quote className="size-4" /> {loading === "quote" ? "Writing…" : "Generate AI quotes"}
          </Button>
          {quotes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {quotes.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { commit(); setCaption({ text: q }); }}
                  className="rounded-md border border-line px-3 py-2 text-left text-sm hover:bg-paper-dim cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="style" className="mt-4 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            disabled={needsImage || loading === "recommend"}
            onClick={() =>
              run("recommend", async () => {
                const { recommendation } = await callAi<{
                  recommendation: { filter: FilterId; reason: string; adjustments: Record<string, number> };
                }>("/api/ai/recommend-filter", { imageDataUrl: project.imageSrc });
                setFilter(recommendation.filter);
                applyAdjustments(recommendation.adjustments);
                toast.success(recommendation.reason);
              })
            }
          >
            <Palette className="size-4" /> {loading === "recommend" ? "Analyzing…" : "AI filter recommendation"}
          </Button>

          <p className="mt-3 font-mono-label text-xs text-ink-soft">TURN THIS INTO…</p>
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setStylePrompt(p)}
                className="rounded-full border border-line px-3 py-1 text-xs hover:bg-paper-dim cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
          <Input value={stylePrompt} onChange={(e) => setStylePrompt(e.target.value)} placeholder="Describe a style…" />
          <Button
            disabled={needsImage || !stylePrompt || loading === "style"}
            onClick={() =>
              run("style", async () => {
                const { result } = await callAi<{
                  result: { filter: FilterId; frameTemplate: FrameTemplateId; adjustments: Record<string, number>; caption: string };
                }>("/api/ai/style-transfer", { imageDataUrl: project.imageSrc, prompt: stylePrompt });
                setFilter(result.filter);
                setFrame(result.frameTemplate);
                applyAdjustments(result.adjustments);
                setCaption({ text: result.caption });
                toast.success("Style applied");
              })
            }
          >
            <Wand2 className="size-4" /> {loading === "style" ? "Transforming…" : "Apply style"}
          </Button>
        </div>

        <div className="border-t border-line pt-4">
          <p className="mb-2 font-mono-label text-xs text-ink-soft">COLORIZE OLD PHOTO</p>
          <Button
            variant="outline"
            disabled={needsImage || loading === "colorize"}
            onClick={() =>
              run("colorize", async () => {
                await callAi("/api/ai/colorize", { imageDataUrl: project.imageSrc });
              })
            }
          >
            <Sparkles className="size-4" /> {loading === "colorize" ? "Colorizing…" : "Colorize black & white photo"}
          </Button>
          <p className="mt-2 text-xs text-ink-soft">
            Needs an image-generation provider key (e.g. Replicate) configured on the server — see README.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
