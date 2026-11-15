"use client";

import { PolaroidProject } from "@/types";

const KEY = "retroframe:projects";

function readAll(): Record<string, PolaroidProject> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, PolaroidProject>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function saveProjectLocal(project: PolaroidProject) {
  const all = readAll();
  all[project.id] = { ...project, updatedAt: new Date().toISOString() };
  writeAll(all);
}

export function listProjectsLocal(): PolaroidProject[] {
  return Object.values(readAll()).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function getProjectLocal(id: string): PolaroidProject | undefined {
  return readAll()[id];
}

export function deleteProjectLocal(id: string) {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

export function toggleFavoriteLocal(id: string) {
  const all = readAll();
  if (all[id]) all[id].isFavorite = !all[id].isFavorite;
  writeAll(all);
}
