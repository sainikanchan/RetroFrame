"use client";

import { useState } from "react";
import Link from "next/link";
import { PolaroidProject } from "@/types";
import { listProjectsLocal, deleteProjectLocal, toggleFavoriteLocal } from "@/lib/localProjects";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const [projects, setProjects] = useState<PolaroidProject[]>(() =>
    typeof window === "undefined" ? [] : listProjectsLocal()
  );

  const refresh = () => setProjects(listProjectsLocal());

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">My Projects</h1>
          <p className="text-sm text-ink-soft">{projects.length} saved memories</p>
        </div>
        <Button asChild variant="accent">
          <Link href="/create"><Plus className="size-4" /> New Polaroid</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onToggleFavorite={(id) => { toggleFavoriteLocal(id); refresh(); }}
              onDelete={(id) => { deleteProjectLocal(id); refresh(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 text-center">
      <div className="polaroid-shadow flex h-32 w-28 flex-col justify-end rounded-sm bg-white p-3 pb-6">
        <div className="aspect-square w-full rounded-[2px] bg-paper-dim" />
      </div>
      <p className="font-display text-lg">No memories yet</p>
      <p className="max-w-sm text-sm text-ink-soft">Upload your first photo and turn it into a Polaroid — it only takes a minute.</p>
      <Button asChild variant="accent" className="mt-2">
        <Link href="/create">Create your first Polaroid</Link>
      </Button>
    </div>
  );
}
