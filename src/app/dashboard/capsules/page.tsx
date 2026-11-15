"use client";

import { useState } from "react";
import { MemoryCapsule, PolaroidProject } from "@/types";
import { listCapsulesLocal, createCapsuleLocal, deleteCapsuleLocal } from "@/lib/localCapsules";
import { listProjectsLocal } from "@/lib/localProjects";
import { CAPSULE_PRESETS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LockOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addDays, formatDistanceToNowStrict } from "date-fns";

export default function CapsulesPage() {
  const [capsules, setCapsules] = useState<MemoryCapsule[]>(() => (typeof window === "undefined" ? [] : listCapsulesLocal()));
  const [projects, setProjects] = useState<PolaroidProject[]>(() =>
    typeof window === "undefined" ? [] : listProjectsLocal()
  );
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [preset, setPreset] = useState("1m");
  const [customDate, setCustomDate] = useState("");
  const [message, setMessage] = useState("");

  const refresh = () => setCapsules(listCapsulesLocal());

  const create = () => {
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) {
      toast.error("Choose a saved Polaroid first.");
      return;
    }
    const days = CAPSULE_PRESETS.find((p) => p.id === preset)?.days ?? 30;
    const unlockAt = preset === "custom" ? new Date(customDate).toISOString() : addDays(new Date(), days).toISOString();
    createCapsuleLocal({ projectId: project.id, title: project.title, coverThumb: project.imageSrc || "", unlockAt, message });
    toast.success("Memory capsule sealed");
    setOpen(false);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Memory Capsules</h1>
          <p className="text-sm text-ink-soft">Lock a memory away and rediscover it later.</p>
        </div>
        <Button variant="accent" onClick={() => { setProjects(listProjectsLocal()); setOpen(true); }}>
          <Plus className="size-4" /> New capsule
        </Button>
      </div>

      {capsules.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">No capsules yet. Save a Polaroid, then seal it away for later.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {capsules.map((c) => (
            <div key={c.id} className="relative overflow-hidden rounded-lg border border-line bg-paper p-3 polaroid-shadow">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-paper-dim">
                {c.coverThumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.coverThumb}
                    alt={c.title}
                    className="h-full w-full object-cover"
                    style={{ filter: c.isUnlocked ? "none" : "blur(16px) brightness(0.6)" }}
                  />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-paper">
                  {c.isUnlocked ? <LockOpen className="size-6" /> : <Lock className="size-6" />}
                  <span className="font-mono-label text-[10px]">
                    {c.isUnlocked ? "UNLOCKED" : `OPENS IN ${formatDistanceToNowStrict(new Date(c.unlockAt))}`}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <button onClick={() => { deleteCapsuleLocal(c.id); refresh(); }} className="cursor-pointer p-1 text-ink-soft hover:text-shutter">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seal a memory capsule</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Choose a saved Polaroid</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {projects.length === 0 && <p className="mt-1 text-xs text-ink-soft">Save a Polaroid from the editor first.</p>}
            </div>
            <div>
              <Label>Unlock after</Label>
              <Select value={preset} onValueChange={setPreset}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CAPSULE_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {preset === "custom" && (
              <div>
                <Label>Custom date</Label>
                <Input className="mt-1.5" type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
              </div>
            )}
            <div>
              <Label>Note to your future self (optional)</Label>
              <Input className="mt-1.5" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Remember this feeling…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="accent" onClick={create}>Seal capsule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
