"use client";

import React, { useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { WASHI_TAPES } from "@/lib/constants";
import { RotateCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";

export function DecorationLayer({ containerSize }: { containerSize: number }) {
  const decorations = useEditorStore((s) => s.project.decorations);
  const selectedId = useEditorStore((s) => s.selectedDecorationId);
  const selectDecoration = useEditorStore((s) => s.selectDecoration);
  const updateDecoration = useEditorStore((s) => s.updateDecoration);
  const removeDecoration = useEditorStore((s) => s.removeDecoration);
  const commit = useEditorStore((s) => s.commit);

  const dragRef = useRef<{ id: string; startX: number; startY: number; ox: number; oy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const d = decorations.find((x) => x.id === id);
    if (!d) return;
    selectDecoration(id);
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, ox: d.x, oy: d.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = ((e.clientX - dragRef.current.startX) / containerSize) * 100;
    const dy = ((e.clientY - dragRef.current.startY) / containerSize) * 100;
    updateDecoration(dragRef.current.id, {
      x: Math.min(100, Math.max(0, dragRef.current.ox + dx)),
      y: Math.min(100, Math.max(0, dragRef.current.oy + dy)),
    });
  };
  const onPointerUp = () => {
    if (dragRef.current) commit();
    dragRef.current = null;
  };

  return (
    <div
      className="absolute inset-0"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => selectDecoration(null)}
    >
      {decorations.map((d) => {
        const isSelected = d.id === selectedId;
        const tape = d.type === "washi" ? WASHI_TAPES.find((t) => t.id === d.value) : null;
        return (
          <div
            key={d.id}
            className="absolute cursor-grab touch-none active:cursor-grabbing"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: `translate(-50%, -50%) rotate(${d.rotation}deg) scale(${d.scale})`,
              zIndex: isSelected ? 30 : 10,
            }}
            onPointerDown={(e) => onPointerDown(e, d.id)}
          >
            {d.type === "sticker" && <span className="text-4xl leading-none drop-shadow-sm">{d.value}</span>}
            {d.type === "washi" && (
              <div
                className="h-6 w-24 opacity-90 shadow-sm"
                style={{
                  background: tape?.color ?? "#E8A33D",
                  backgroundImage:
                    tape?.pattern === "dots"
                      ? "radial-gradient(circle, rgba(255,255,255,0.6) 2px, transparent 2px)"
                      : tape?.pattern === "stripe"
                      ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0 4px, transparent 4px 8px)"
                      : tape?.pattern === "check"
                      ? "repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 3px, transparent 3px 8px), repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 3px, transparent 3px 8px)"
                      : undefined,
                  backgroundSize: "10px 10px",
                  clipPath: "polygon(2% 20%,98% 0,100% 80%,0 100%)",
                }}
              />
            )}

            {isSelected && (
              <div
                className="absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-sprocket/90 px-1.5 py-1 shadow-lg"
                style={{ transform: `translateX(-50%) rotate(${-d.rotation}deg) scale(${1 / d.scale})` }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  className="rounded-full p-1 text-paper hover:bg-paper/20 cursor-pointer"
                  onClick={() => updateDecoration(d.id, { rotation: d.rotation + 15 })}
                  aria-label="Rotate"
                >
                  <RotateCw className="size-3.5" />
                </button>
                <button
                  className="rounded-full p-1 text-paper hover:bg-paper/20 cursor-pointer"
                  onClick={() => updateDecoration(d.id, { scale: Math.min(3, d.scale + 0.15) })}
                  aria-label="Enlarge"
                >
                  <ZoomIn className="size-3.5" />
                </button>
                <button
                  className="rounded-full p-1 text-paper hover:bg-paper/20 cursor-pointer"
                  onClick={() => updateDecoration(d.id, { scale: Math.max(0.3, d.scale - 0.15) })}
                  aria-label="Shrink"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <button
                  className="rounded-full p-1 text-shutter hover:bg-paper/20 cursor-pointer"
                  onClick={() => removeDecoration(d.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
