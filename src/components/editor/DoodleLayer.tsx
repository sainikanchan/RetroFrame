"use client";

import React, { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";

export function DoodleLayer({ size }: { size: number }) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<import("fabric").Canvas | null>(null);
  const drawingMode = useEditorStore((s) => s.drawingMode);
  const penColor = useEditorStore((s) => s.penColor);
  const penWidth = useEditorStore((s) => s.penWidth);
  const clearTick = useEditorStore((s) => s.clearDoodleTick);

  useEffect(() => {
    let disposed = false;
    (async () => {
      const fabric = await import("fabric");
      if (disposed || !canvasElRef.current) return;
      const canvas = new fabric.Canvas(canvasElRef.current, {
        isDrawingMode: false,
        selection: false,
        width: size,
        height: size,
      });
      const brush = new fabric.PencilBrush(canvas);
      brush.color = penColor;
      brush.width = penWidth;
      canvas.freeDrawingBrush = brush;
      fabricCanvasRef.current = canvas;
    })();
    return () => {
      disposed = true;
      fabricCanvasRef.current?.dispose();
      fabricCanvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = drawingMode;
    canvas.selection = false;
    canvas.forEachObject((o) => (o.selectable = false));
  }, [drawingMode]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canvas.freeDrawingBrush) return;
    canvas.freeDrawingBrush.color = penColor;
    canvas.freeDrawingBrush.width = penWidth;
  }, [penColor, penWidth]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || clearTick === 0) return;
    canvas.clear();
  }, [clearTick]);

  return (
    <div
      className="absolute inset-0"
      style={{ pointerEvents: drawingMode ? "auto" : "none", zIndex: 20 }}
    >
      <canvas ref={canvasElRef} width={size} height={size} />
    </div>
  );
}
