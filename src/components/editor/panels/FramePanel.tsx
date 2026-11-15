"use client";

import React from "react";
import { useEditorStore } from "@/store/editorStore";
import { FRAME_TEMPLATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FramePanel() {
  const frameTemplate = useEditorStore((s) => s.project.frameTemplate);
  const setFrame = useEditorStore((s) => s.setFrame);

  return (
    <div className="grid grid-cols-2 gap-3">
      {FRAME_TEMPLATES.map((f) => (
        <button
          key={f.id}
          onClick={() => setFrame(f.id)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border p-3 text-left transition-colors cursor-pointer",
            frameTemplate === f.id ? "border-safelight bg-safelight/10" : "border-line hover:bg-paper-dim"
          )}
        >
          <div
            className="flex h-16 w-14 flex-col items-center justify-end rounded-sm"
            style={{ background: f.borderColor, padding: 4, border: f.id === "film-strip" ? "1px solid #000" : undefined }}
          >
            <div className="w-full flex-1 bg-[#c9c0a8]" />
            <div style={{ height: 10 }} />
          </div>
          <div>
            <p className="text-sm font-medium">{f.name}</p>
            <p className="text-xs text-ink-soft">{f.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
