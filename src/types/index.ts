export type FrameTemplateId =
  | "classic-white"
  | "vintage"
  | "colorful"
  | "torn-paper"
  | "minimal"
  | "film-strip";

export interface FrameTemplate {
  id: FrameTemplateId;
  name: string;
  description: string;
  borderColor: string;
  bottomHeight: number; // relative caption strip height as fraction of photo width
  borderWidth: number;
  rotationJitter: number; // deg, used when scattered on scrapbook
  accentColor?: string;
  paperTexture?: boolean;
  tornEdges?: boolean;
  filmSprockets?: boolean;
}

export type FilterId =
  | "original"
  | "bw"
  | "sepia"
  | "vintage"
  | "retro-film"
  | "warm"
  | "cool"
  | "vibrant"
  | "film-grain"
  | "light-leaks"
  | "dust-scratch"
  | "disposable";

export interface FilterDef {
  id: FilterId;
  name: string;
  css: string; // CSS filter() string used for quick live preview thumbnails
  overlay?: "grain" | "leaks" | "dust" | "disposable-flash";
}

export interface Adjustments {
  brightness: number; // -100..100
  contrast: number; // -100..100
  saturation: number; // -100..100
  exposure: number; // -100..100
  sharpness: number; // 0..100
  blur: number; // 0..20
  temperature: number; // -100..100 (blue..amber)
  vignette: number; // 0..100
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  sharpness: 0,
  blur: 0,
  temperature: 0,
  vignette: 0,
};

export interface CaptionStyle {
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: number;
  align: "left" | "center" | "right";
}

export interface StampData {
  dateStamp: boolean;
  dateFormat: string;
  customDate?: string;
  locationStamp: boolean;
  locationText: string;
  signature: string;
  signatureFont: string;
}

export type DecorationType = "sticker" | "washi" | "doodle" | "pattern";

export interface DecorationInstance {
  id: string;
  type: DecorationType;
  value: string; // emoji char, tape color id, pattern id, or svg path data
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface ImageTransform {
  zoom: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

export interface PolaroidProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  imageSrc: string | null;
  frameTemplate: FrameTemplateId;
  filter: FilterId;
  adjustments: Adjustments;
  transform: ImageTransform;
  caption: CaptionStyle;
  stamps: StampData;
  decorations: DecorationInstance[];
  canvasJSON?: string;
  isFavorite?: boolean;
  isPublic?: boolean;
}

export interface MemoryCapsule {
  id: string;
  projectId: string;
  title: string;
  coverThumb: string;
  createdAt: string;
  unlockAt: string;
  isUnlocked: boolean;
  message?: string;
}

export interface GalleryPost {
  id: string;
  projectId: string;
  authorName: string;
  authorAvatar?: string;
  thumb: string;
  likes: number;
  remixCount: number;
  createdAt: string;
}

export interface ScrapbookTemplate {
  id: string;
  name: string;
  category: "birthday" | "travel" | "graduation" | "wedding" | "festival" | "journal";
  thumb: string;
  slotCount: number;
}
