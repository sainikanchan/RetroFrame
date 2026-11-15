"use client";

import React from "react";
import { useEditorStore } from "@/store/editorStore";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Adjustments } from "@/types";
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Undo2, Redo2 } from "lucide-react";

const SLIDERS: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: "brightness", label: "Brightness", min: -100, max: 100 },
  { key: "contrast", label: "Contrast", min: -100, max: 100 },
  { key: "saturation", label: "Saturation", min: -100, max: 100 },
  { key: "exposure", label: "Exposure", min: -100, max: 100 },
  { key: "sharpness", label: "Sharpness", min: 0, max: 100 },
  { key: "blur", label: "Blur", min: 0, max: 100 },
  { key: "temperature", label: "Temperature", min: -100, max: 100 },
  { key: "vignette", label: "Vignette", min: 0, max: 100 },
];

export function AdjustPanel() {
  const adjustments = useEditorStore((s) => s.project.adjustments);
  const setAdjustment = useEditorStore((s) => s.setAdjustment);
  const resetAdjustments = useEditorStore((s) => s.resetAdjustments);
  const commit = useEditorStore((s) => s.commit);
  const transform = useEditorStore((s) => s.project.transform);
  const setTransform = useEditorStore((s) => s.setTransform);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.history.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between rounded-lg border border-line p-2">
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => setTransform({ rotation: transform.rotation - 90 })} title="Rotate left">
            <RotateCcw className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setTransform({ rotation: transform.rotation + 90 })} title="Rotate right">
            <RotateCw className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setTransform({ zoom: Math.min(3, transform.zoom + 0.1) })} title="Zoom in">
            <ZoomIn className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setTransform({ zoom: Math.max(1, transform.zoom - 0.1) })} title="Zoom out">
            <ZoomOut className="size-4" />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" disabled={!canUndo} onClick={undo} title="Undo">
            <Undo2 className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" disabled={!canRedo} onClick={redo} title="Redo">
            <Redo2 className="size-4" />
          </Button>
        </div>
      </div>
      <p className="-mt-2 text-xs text-ink-soft">Drag the photo to reposition it inside the frame. Scroll to zoom.</p>

      <div className="flex flex-col gap-4">
        {SLIDERS.map((s) => (
          <div key={s.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>{s.label}</Label>
              <span className="text-xs text-ink-soft">{adjustments[s.key]}</span>
            </div>
            <Slider
              min={s.min}
              max={s.max}
              step={1}
              value={[adjustments[s.key]]}
              onValueChange={([v]) => setAdjustment(s.key, v)}
              onValueCommit={() => commit()}
            />
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={resetAdjustments}>
        Reset adjustments
      </Button>
    </div>
  );
}
