"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@/store/editorStore";
import { EditorToolbar } from "./EditorToolbar";
import { PolaroidCard } from "./PolaroidCard";
import { UploadPanel } from "./panels/UploadPanel";
import { FramePanel } from "./panels/FramePanel";
import { FilterPanel } from "./panels/FilterPanel";
import { AdjustPanel } from "./panels/AdjustPanel";
import { TextPanel } from "./panels/TextPanel";
import { DecorationPanel } from "./panels/DecorationPanel";
import { AiPanel } from "./panels/AiPanel";
import { ExportPanel } from "./panels/ExportPanel";
import { saveProjectLocal, getProjectLocal } from "@/lib/localProjects";
import {
  ImagePlus,
  Frame as FrameIcon,
  SlidersHorizontal,
  Wand,
  Type,
  Sticker,
  Sparkles,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "upload", label: "Upload", icon: ImagePlus },
  { id: "frame", label: "Frame", icon: FrameIcon },
  { id: "filter", label: "Filter", icon: Wand },
  { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
  { id: "text", label: "Text", icon: Type },
  { id: "decorate", label: "Decorate", icon: Sticker },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "export", label: "Export", icon: Download },
] as const;

export function EditorShell() {
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);
  const project = useEditorStore((s) => s.project);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [savedTick, setSavedTick] = useState(0);
  const loadProject = useEditorStore((s) => s.loadProject);
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("project");
    if (id) {
      const existing = getProjectLocal(id);
      if (existing) loadProject(existing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y")) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // Autosave draft every few seconds after changes
  useEffect(() => {
    if (!project.imageSrc) return;
    const t = setTimeout(() => {
      saveProjectLocal(project);
      setSavedTick((n) => n + 1);
    }, 2500);
    return () => clearTimeout(t);
  }, [project]);

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <EditorToolbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left tab rail */}
        <nav className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-line bg-paper-dim/40 py-3 sm:w-20">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={cn(
                  "flex w-14 flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors cursor-pointer sm:w-16",
                  active ? "bg-safelight text-sprocket" : "text-ink-soft hover:bg-paper-dim"
                )}
              >
                <Icon className="size-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Context panel */}
        <div className="w-[320px] shrink-0 overflow-y-auto border-r border-line p-4">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activePanel}
              initial={{ y: 6 }}
              animate={{ y: 0 }}
              exit={{ y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activePanel === "upload" && <UploadPanel />}
              {activePanel === "frame" && <FramePanel />}
              {activePanel === "filter" && <FilterPanel />}
              {activePanel === "adjust" && <AdjustPanel />}
              {activePanel === "text" && <TextPanel />}
              {activePanel === "decorate" && <DecorationPanel />}
              {activePanel === "ai" && <AiPanel />}
              {activePanel === "export" && <ExportPanel cardRef={cardRef} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Canvas stage */}
        <div className="relative flex flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_center,var(--paper-dim)_0%,var(--paper)_70%)] p-8">
          <motion.div
            initial={{ scale: 0.96, rotate: 0 }}
            animate={{ scale: 1, rotate: -1.5 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <PolaroidCard ref={cardRef} />
          </motion.div>
          <div className="absolute bottom-4 right-4 font-mono-label text-[10px] text-ink-soft">
            {savedTick > 0 ? "DRAFT AUTOSAVED" : "UNSAVED DRAFT"}
          </div>
        </div>
      </div>
    </div>
  );
}
