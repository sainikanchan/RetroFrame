"use client";

import React, { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { exportProject } from "@/lib/canvas/renderProject";
import { saveProjectLocal } from "@/lib/localProjects";
import { Download, Save, FileImage, FileText } from "lucide-react";
import { toast } from "sonner";

export function ExportPanel({ cardRef }: { cardRef: React.RefObject<HTMLDivElement | null> }) {
  const project = useEditorStore((s) => s.project);
  const setTitle = useEditorStore((s) => s.setTitle);
  const [highRes, setHighRes] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const doExport = async (format: "png" | "jpg" | "pdf") => {
    if (!project.imageSrc) {
      toast.error("Add a photo before exporting.");
      return;
    }
    setBusy(format);
    try {
      // Pull the live doodle canvas straight out of the DOM so any pen
      // strokes get baked into the export too.
      const doodleCanvas = cardRef.current?.querySelector<HTMLCanvasElement>("canvas.lower-canvas, canvas") ?? null;
      await exportProject(
        project,
        doodleCanvas,
        format,
        project.title.replace(/\s+/g, "-").toLowerCase() || "retroframe",
        highRes ? 4 : 2
      );
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("RetroFrame export failed:", err);
      toast.error(err instanceof Error ? err.message : "Export failed — please try again.");
    } finally {
      setBusy(null);
    }
  };

  const save = () => {
    saveProjectLocal(project);
    toast.success("Saved to My Projects");
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label>Project title</Label>
        <Input className="mt-1.5" value={project.title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-line p-3">
        <div>
          <p className="text-sm font-medium">High-resolution export</p>
          <p className="text-xs text-ink-soft">4x scale, best for printing</p>
        </div>
        <Switch checked={highRes} onCheckedChange={setHighRes} />
      </div>

      <div className="flex flex-col gap-2">
        <Button disabled={busy !== null} onClick={() => doExport("png")}>
          <FileImage className="size-4" /> {busy === "png" ? "Exporting…" : "Download PNG"}
        </Button>
        <Button variant="secondary" disabled={busy !== null} onClick={() => doExport("jpg")}>
          <Download className="size-4" /> {busy === "jpg" ? "Exporting…" : "Download JPG"}
        </Button>
        <Button variant="secondary" disabled={busy !== null} onClick={() => doExport("pdf")}>
          <FileText className="size-4" /> {busy === "pdf" ? "Exporting…" : "Download PDF"}
        </Button>
      </div>

      <Button variant="outline" onClick={save}>
        <Save className="size-4" /> Save to My Projects
      </Button>
      <p className="text-xs text-ink-soft">
        Projects save to this browser for now. Connect Supabase (see README) to sync across devices and enable
        sharing, public gallery, and memory capsules.
      </p>
    </div>
  );
}
