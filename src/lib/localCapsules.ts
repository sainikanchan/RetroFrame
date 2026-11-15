"use client";

import { MemoryCapsule } from "@/types";
import { nanoid } from "@/lib/nanoid";

const KEY = "retroframe:capsules";

function readAll(): MemoryCapsule[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function writeAll(data: MemoryCapsule[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function listCapsulesLocal(): MemoryCapsule[] {
  return readAll()
    .map((c) => ({ ...c, isUnlocked: new Date(c.unlockAt).getTime() <= Date.now() }))
    .sort((a, b) => +new Date(a.unlockAt) - +new Date(b.unlockAt));
}

export function createCapsuleLocal(input: {
  projectId: string;
  title: string;
  coverThumb: string;
  unlockAt: string;
  message?: string;
}): MemoryCapsule {
  const capsule: MemoryCapsule = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    isUnlocked: false,
    ...input,
  };
  const all = readAll();
  all.push(capsule);
  writeAll(all);
  return capsule;
}

export function deleteCapsuleLocal(id: string) {
  writeAll(readAll().filter((c) => c.id !== id));
}
