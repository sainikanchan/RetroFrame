"use client";

import Link from "next/link";
import { PolaroidProject } from "@/types";
import { Heart, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FRAME_TEMPLATES } from "@/lib/constants";

export function ProjectCard({
  project,
  onToggleFavorite,
  onDelete,
}: {
  project: PolaroidProject;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const frame = FRAME_TEMPLATES.find((f) => f.id === project.frameTemplate);
  return (
    <div className="group relative rounded-lg border border-line bg-paper p-3 polaroid-shadow">
      <Link href={`/create?project=${project.id}`}>
        <div
          className="flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-sm"
          style={{ background: frame?.borderColor, padding: 10 }}
        >
          {project.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.imageSrc} alt={project.title} className="aspect-square w-full rounded-[2px] object-cover" />
          ) : (
            <div className="aspect-square w-full rounded-[2px] bg-paper-dim" />
          )}
          <div style={{ height: 18 }} />
        </div>
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <p className="truncate text-sm font-medium">{project.title}</p>
        <div className="flex items-center gap-1">
          {onToggleFavorite && (
            <button onClick={() => onToggleFavorite(project.id)} className="cursor-pointer p-1 text-ink-soft hover:text-shutter">
              <Heart className={cn("size-4", project.isFavorite && "fill-shutter text-shutter")} />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(project.id)} className="cursor-pointer p-1 text-ink-soft hover:text-shutter">
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
