"use client";

import { useState } from "react";
import { PolaroidProject } from "@/types";
import { listProjectsLocal, deleteProjectLocal, toggleFavoriteLocal } from "@/lib/localProjects";
import { ProjectCard } from "@/components/dashboard/project-card";

export default function FavoritesPage() {
  const [projects, setProjects] = useState<PolaroidProject[]>(() =>
    typeof window === "undefined" ? [] : listProjectsLocal().filter((p) => p.isFavorite)
  );
  const refresh = () => setProjects(listProjectsLocal().filter((p) => p.isFavorite));

  return (
    <div>
      <h1 className="font-display text-2xl">Favorites</h1>
      <p className="text-sm text-ink-soft">Polaroids you&apos;ve hearted.</p>
      {projects.length === 0 ? (
        <p className="mt-10 text-sm text-ink-soft">Tap the heart on any project to pin it here.</p>
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
