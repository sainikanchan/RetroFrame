"use client";

import { create } from "zustand";
import { nanoid } from "@/lib/nanoid";
import {
  Adjustments,
  CaptionStyle,
  DecorationInstance,
  DEFAULT_ADJUSTMENTS,
  FilterId,
  FrameTemplateId,
  ImageTransform,
  PolaroidProject,
  StampData,
} from "@/types";

const DEFAULT_CAPTION: CaptionStyle = {
  text: "",
  fontFamily: "var(--font-caveat)",
  fontSize: 28,
  color: "#211E1B",
  fontWeight: 500,
  align: "center",
};

const DEFAULT_STAMPS: StampData = {
  dateStamp: false,
  dateFormat: "MMM d, yyyy",
  locationStamp: false,
  locationText: "",
  signature: "",
  signatureFont: "var(--font-caveat)",
};

const DEFAULT_TRANSFORM: ImageTransform = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};

export function createEmptyProject(): PolaroidProject {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    title: "Untitled Memory",
    createdAt: now,
    updatedAt: now,
    imageSrc: null,
    frameTemplate: "classic-white",
    filter: "original",
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    transform: { ...DEFAULT_TRANSFORM },
    caption: { ...DEFAULT_CAPTION },
    stamps: { ...DEFAULT_STAMPS },
    decorations: [],
  };
}

interface EditorState {
  project: PolaroidProject;
  history: PolaroidProject[];
  future: PolaroidProject[];
  activePanel: string;
  selectedDecorationId: string | null;
  drawingMode: boolean;
  penColor: string;
  penWidth: number;
  clearDoodleTick: number;
  uploadedImages: string[];
  addUploadedImages: (srcs: string[]) => void;

  setImage: (src: string) => void;
  setFrame: (id: FrameTemplateId) => void;
  setFilter: (id: FilterId) => void;
  setAdjustment: (key: keyof Adjustments, value: number) => void;
  resetAdjustments: () => void;
  setTransform: (partial: Partial<ImageTransform>) => void;
  setCaption: (partial: Partial<CaptionStyle>) => void;
  setStamps: (partial: Partial<StampData>) => void;
  addDecoration: (d: Omit<DecorationInstance, "id">) => void;
  updateDecoration: (id: string, partial: Partial<DecorationInstance>) => void;
  removeDecoration: (id: string) => void;
  selectDecoration: (id: string | null) => void;
  setTitle: (title: string) => void;
  setActivePanel: (panel: string) => void;
  commit: () => void;
  undo: () => void;
  redo: () => void;
  loadProject: (p: PolaroidProject) => void;
  newProject: () => void;
  setDrawingMode: (v: boolean) => void;
  setPenColor: (c: string) => void;
  setPenWidth: (w: number) => void;
  clearDoodle: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: createEmptyProject(),
  history: [],
  future: [],
  activePanel: "upload",
  selectedDecorationId: null,
  drawingMode: false,
  penColor: "#C1503F",
  penWidth: 4,
  clearDoodleTick: 0,
  uploadedImages: [],
  addUploadedImages: (srcs) => set((s) => ({ uploadedImages: [...srcs, ...s.uploadedImages].slice(0, 24) })),

  commit: () => {
    const { project, history } = get();
    set({ history: [...history, project].slice(-40), future: [] });
  },

  setImage: (src) => {
    get().commit();
    set((s) => ({
      project: {
        ...s.project,
        imageSrc: src,
        transform: { ...DEFAULT_TRANSFORM },
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  setFrame: (id) => {
    get().commit();
    set((s) => ({ project: { ...s.project, frameTemplate: id, updatedAt: new Date().toISOString() } }));
  },

  setFilter: (id) => {
    get().commit();
    set((s) => ({ project: { ...s.project, filter: id, updatedAt: new Date().toISOString() } }));
  },

  setAdjustment: (key, value) => {
    set((s) => ({
      project: {
        ...s.project,
        adjustments: { ...s.project.adjustments, [key]: value },
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  resetAdjustments: () => {
    get().commit();
    set((s) => ({ project: { ...s.project, adjustments: { ...DEFAULT_ADJUSTMENTS } } }));
  },

  setTransform: (partial) => {
    set((s) => ({ project: { ...s.project, transform: { ...s.project.transform, ...partial } } }));
  },

  setCaption: (partial) => {
    set((s) => ({ project: { ...s.project, caption: { ...s.project.caption, ...partial } } }));
  },

  setStamps: (partial) => {
    set((s) => ({ project: { ...s.project, stamps: { ...s.project.stamps, ...partial } } }));
  },

  addDecoration: (d) => {
    get().commit();
    const id = nanoid();
    set((s) => ({
      project: { ...s.project, decorations: [...s.project.decorations, { ...d, id }] },
      selectedDecorationId: id,
    }));
  },

  updateDecoration: (id, partial) => {
    set((s) => ({
      project: {
        ...s.project,
        decorations: s.project.decorations.map((d) => (d.id === id ? { ...d, ...partial } : d)),
      },
    }));
  },

  removeDecoration: (id) => {
    get().commit();
    set((s) => ({
      project: { ...s.project, decorations: s.project.decorations.filter((d) => d.id !== id) },
      selectedDecorationId: s.selectedDecorationId === id ? null : s.selectedDecorationId,
    }));
  },

  selectDecoration: (id) => set({ selectedDecorationId: id }),

  setTitle: (title) => set((s) => ({ project: { ...s.project, title } })),

  setActivePanel: (panel) => set({ activePanel: panel }),

  undo: () => {
    const { history, project, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({
      project: prev,
      history: history.slice(0, -1),
      future: [project, ...future].slice(0, 40),
    });
  },

  redo: () => {
    const { future, project, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      project: next,
      future: future.slice(1),
      history: [...history, project].slice(-40),
    });
  },

  loadProject: (p) => set({ project: p, history: [], future: [] }),

  newProject: () => set({ project: createEmptyProject(), history: [], future: [] }),

  setDrawingMode: (v) => set({ drawingMode: v }),
  setPenColor: (c) => set({ penColor: c }),
  setPenWidth: (w) => set({ penWidth: w }),
  clearDoodle: () => set((s) => ({ clearDoodleTick: s.clearDoodleTick + 1 })),
}));
