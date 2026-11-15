"use client";

import React from "react";
import Link from "next/link";
import { useEditorStore } from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, ArrowLeft, Save } from "lucide-react";
import { saveProjectLocal } from "@/lib/localProjects";
import { toast } from "sonner";

export function EditorToolbar() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.history.length > 0);
  const canRedo = useEditorStore((s) => s.future.length > 0);
  const project = useEditorStore((s) => s.project);
  const setTitle = useEditorStore((s) => s.setTitle);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-paper px-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-ink-soft hover:text-ink">
          <ArrowLeft className="size-5" />
        </Link>
        <input
          value={project.title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent font-display text-base outline-none w-40 sm:w-64"
        />
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)">
          <Undo2 className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="accent"
          className="ml-2"
          onClick={() => {
            saveProjectLocal(project);
            toast.success("Saved");
          }}
        >
          <Save className="size-4" /> Save
        </Button>
      </div>
    </header>
  );
}
