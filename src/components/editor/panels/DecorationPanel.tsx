"use client";

import React from "react";
import { useEditorStore } from "@/store/editorStore";
import { STICKERS, WASHI_TAPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Pencil, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

const PEN_COLORS = ["#211E1B", "#C1503F", "#E8A33D", "#3B4A5A", "#7C8B6F", "#FFFFFF"];

export function DecorationPanel() {
  const addDecoration = useEditorStore((s) => s.addDecoration);
  const drawingMode = useEditorStore((s) => s.drawingMode);
  const setDrawingMode = useEditorStore((s) => s.setDrawingMode);
  const penColor = useEditorStore((s) => s.penColor);
  const setPenColor = useEditorStore((s) => s.setPenColor);
  const penWidth = useEditorStore((s) => s.penWidth);
  const setPenWidth = useEditorStore((s) => s.setPenWidth);
  const clearDoodle = useEditorStore((s) => s.clearDoodle);

  return (
    <Tabs defaultValue="stickers">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="stickers">Stickers</TabsTrigger>
        <TabsTrigger value="tape">Washi Tape</TabsTrigger>
        <TabsTrigger value="pen">Pen Tool</TabsTrigger>
      </TabsList>

      <TabsContent value="stickers" className="mt-4 flex flex-col gap-4">
        {STICKERS.map((group) => (
          <div key={group.category}>
            <p className="mb-2 font-mono-label text-xs text-ink-soft">{group.category.toUpperCase()}</p>
            <div className="grid grid-cols-6 gap-1.5">
              {group.items.map((emoji) => (
                <button
                  key={emoji}
                  className="flex aspect-square items-center justify-center rounded-md text-xl hover:bg-paper-dim cursor-pointer"
                  onClick={() =>
                    addDecoration({ type: "sticker", value: emoji, x: 50, y: 50, rotation: 0, scale: 1 })
                  }
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="tape" className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          {WASHI_TAPES.map((tape) => (
            <button
              key={tape.id}
              onClick={() => addDecoration({ type: "washi", value: tape.id, x: 50, y: 20, rotation: -8, scale: 1 })}
              className="flex h-10 items-center justify-center rounded-md border border-line hover:ring-2 hover:ring-safelight cursor-pointer"
              style={{ background: tape.color }}
            >
              <span className="text-[10px] font-mono-label text-white/90 mix-blend-difference">{tape.id}</span>
            </button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="pen" className="mt-4 flex flex-col gap-4">
        <Button variant={drawingMode ? "accent" : "outline"} onClick={() => setDrawingMode(!drawingMode)}>
          <Pencil className="size-4" /> {drawingMode ? "Drawing — tap to stop" : "Start drawing"}
        </Button>
        <div>
          <p className="mb-2 font-mono-label text-xs text-ink-soft">COLOR</p>
          <div className="flex gap-2">
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                className={cn("size-7 rounded-full border-2 cursor-pointer", penColor === c ? "border-safelight" : "border-line")}
                style={{ background: c }}
                onClick={() => setPenColor(c)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono-label text-xs text-ink-soft">WIDTH</p>
          <Slider min={1} max={20} value={[penWidth]} onValueChange={([v]) => setPenWidth(v)} />
        </div>
        <Button variant="outline" size="sm" onClick={clearDoodle}>
          <Eraser className="size-4" /> Clear doodles
        </Button>
        <p className="text-xs text-ink-soft">
          Draw directly on the photo. Turn drawing off to reposition or add more stickers.
        </p>
      </TabsContent>
    </Tabs>
  );
}
