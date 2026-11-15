"use client";

import React from "react";
import { useEditorStore } from "@/store/editorStore";
import { FILTERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FilterPanel() {
  const filter = useEditorStore((s) => s.project.filter);
  const setFilter = useEditorStore((s) => s.setFilter);
  const imageSrc = useEditorStore((s) => s.project.imageSrc);

  return (
    <div className="grid grid-cols-3 gap-3">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors cursor-pointer",
            filter === f.id ? "border-safelight bg-safelight/10" : "border-line hover:bg-paper-dim"
          )}
        >
          <div className="aspect-square w-full overflow-hidden rounded-sm bg-[#d8d0bc]">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageSrc} alt={f.name} className="h-full w-full object-cover" style={{ filter: f.css }} />
            ) : (
              <div className="h-full w-full" style={{ filter: f.css, background: "linear-gradient(135deg,#e7ceb0,#b9a685)" }} />
            )}
          </div>
          <span className="text-center text-[11px] leading-tight">{f.name}</span>
        </button>
      ))}
    </div>
  );
}
