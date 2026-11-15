"use client";

import React, { useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { FRAME_TEMPLATES } from "@/lib/constants";
import { buildFilterCss, getOverlayForFilter } from "@/lib/canvas/filters";
import { DecorationLayer } from "./DecorationLayer";
import { DoodleLayer } from "./DoodleLayer";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const CARD_WIDTH = 360;

export const PolaroidCard = React.forwardRef<HTMLDivElement, { interactive?: boolean; className?: string }>(
  function PolaroidCard({ interactive = true, className }, forwardedRef) {
    const project = useEditorStore((s) => s.project);
    const setTransform = useEditorStore((s) => s.setTransform);
    const commit = useEditorStore((s) => s.commit);
    const setCaption = useEditorStore((s) => s.setCaption);

    const frame = FRAME_TEMPLATES.find((f) => f.id === project.frameTemplate)!;
    const cssFilter = buildFilterCss(project.filter, project.adjustments);
    const overlay = getOverlayForFilter(project.filter);

    const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
    const localRef = useRef<HTMLDivElement | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [forwardedRef]
    );

    const bottomHeightPx = Math.round(CARD_WIDTH * frame.bottomHeight);
    const photoSize = CARD_WIDTH - frame.borderWidth * 2;

    const onPointerDown = (e: React.PointerEvent) => {
      if (!interactive || !project.imageSrc) return;
      (e.target as Element).setPointerCapture(e.pointerId);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        ox: project.transform.offsetX,
        oy: project.transform.offsetY,
      };
    };
    const onPointerMove = (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setTransform({ offsetX: dragRef.current.ox + dx, offsetY: dragRef.current.oy + dy });
    };
    const onPointerUp = () => {
      if (dragRef.current) commit();
      dragRef.current = null;
    };
    const onWheel = (e: React.WheelEvent) => {
      if (!interactive || !project.imageSrc) return;
      e.preventDefault();
      const next = Math.min(3, Math.max(1, project.transform.zoom - e.deltaY * 0.001));
      setTransform({ zoom: next });
    };

    return (
      <div
        ref={setRefs}
        data-polaroid-card
        className={cn("relative select-none", frame.tornEdges && "torn-edge-top", className)}
        style={{
          width: CARD_WIDTH,
          background: frame.borderColor,
          padding: frame.borderWidth,
          paddingBottom: bottomHeightPx,
          borderRadius: frame.id === "minimal" ? 2 : 3,
        }}
      >
        {frame.paperTexture && <div className="paper-grain absolute inset-0 rounded-[3px] pointer-events-none" />}
        {frame.accentColor && (
          <div className="absolute inset-x-0 top-0 h-2 rounded-t-[3px]" style={{ background: frame.accentColor }} />
        )}

        {/* Photo well */}
        <div
          className="relative overflow-hidden bg-[#d8d0bc]"
          style={{ width: photoSize, height: photoSize }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
        >
          {project.imageSrc ? (
            <img
              src={project.imageSrc}
              alt="Uploaded memory"
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none cursor-grab active:cursor-grabbing"
              style={{
                width: photoSize,
                height: photoSize,
                objectFit: "cover",
                filter: cssFilter,
                transform: `translate(-50%, -50%) translate(${project.transform.offsetX}px, ${project.transform.offsetY}px) scale(${project.transform.zoom}) rotate(${project.transform.rotation}deg)`,
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ink-soft text-xs font-mono-label text-center px-4">
              NO PHOTO YET
            </div>
          )}

          {overlay === "grain" && <GrainOverlay />}
          {overlay === "leaks" && <LightLeaksOverlay />}
          {overlay === "dust" && <DustOverlay />}
          {overlay === "disposable-flash" && <DisposableFlashOverlay />}
          {project.adjustments.vignette > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `inset 0 0 ${photoSize * 0.5 * (project.adjustments.vignette / 100)}px ${
                  photoSize * 0.12
                }px rgba(0,0,0,${0.55 * (project.adjustments.vignette / 100)})`,
              }}
            />
          )}

          {frame.id === "film-strip" && (
            <>
              <div className="sprocket-strip absolute left-0 top-0 h-full w-3" />
              <div className="sprocket-strip absolute right-0 top-0 h-full w-3" />
            </>
          )}

          {interactive && <DecorationLayer containerSize={photoSize} />}
          {interactive && <DoodleLayer size={photoSize} />}
        </div>

        {/* Caption strip */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center gap-0.5 px-3"
          style={{ height: bottomHeightPx }}
        >
          {interactive ? (
            <textarea
              value={project.caption.text}
              onChange={(e) => setCaption({ text: e.target.value })}
              placeholder="Write a caption…"
              rows={1}
              className="w-full resize-none bg-transparent text-center outline-none placeholder:text-ink-soft/60"
              style={{
                fontFamily: project.caption.fontFamily,
                fontSize: project.caption.fontSize,
                color: project.caption.color,
                fontWeight: project.caption.fontWeight,
                textAlign: project.caption.align,
                lineHeight: 1.15,
              }}
            />
          ) : (
            project.caption.text && (
              <div
                style={{
                  fontFamily: project.caption.fontFamily,
                  fontSize: project.caption.fontSize,
                  color: project.caption.color,
                  fontWeight: project.caption.fontWeight,
                  textAlign: project.caption.align,
                }}
              >
                {project.caption.text}
              </div>
            )
          )}
          <div className="flex items-center gap-2 font-mono-label text-[10px] text-ink-soft/80">
            {project.stamps.dateStamp && (
              <span>{format(new Date(project.stamps.customDate || project.updatedAt), "MMM d, yyyy").toUpperCase()}</span>
            )}
            {project.stamps.dateStamp && project.stamps.locationStamp && project.stamps.locationText && <span>·</span>}
            {project.stamps.locationStamp && project.stamps.locationText && (
              <span>{project.stamps.locationText.toUpperCase()}</span>
            )}
          </div>
          {project.stamps.signature && (
            <div
              className="text-sm"
              style={{ fontFamily: project.stamps.signatureFont, color: project.caption.color }}
            >
              {project.stamps.signature}
            </div>
          )}
        </div>
      </div>
    );
  }
);

function GrainOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}
function LightLeaksOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
      style={{
        background:
          "radial-gradient(circle at 85% 10%, rgba(255,150,60,0.55), transparent 45%), radial-gradient(circle at 5% 95%, rgba(255,60,120,0.35), transparent 50%)",
      }}
    />
  );
}
function DustOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-50 mix-blend-multiply"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.5) 1px, transparent 1.4px), radial-gradient(circle, rgba(0,0,0,0.35) 1px, transparent 1.2px)",
        backgroundSize: "37px 41px, 23px 29px",
        backgroundPosition: "3px 7px, 15px 2px",
      }}
    />
  );
}
function DisposableFlashOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none mix-blend-screen opacity-60"
      style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.55), transparent 60%)" }}
    />
  );
}
