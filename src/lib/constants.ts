import { FrameTemplate, FilterDef, ScrapbookTemplate } from "@/types";

export const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: "classic-white",
    name: "Classic White",
    description: "The original Polaroid look — clean white borders.",
    borderColor: "#FBFAF7",
    bottomHeight: 0.28,
    borderWidth: 18,
    rotationJitter: 3,
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Cream border with warm foxing and soft grain.",
    borderColor: "#EFE3C8",
    bottomHeight: 0.3,
    borderWidth: 20,
    rotationJitter: 4,
    paperTexture: true,
  },
  {
    id: "colorful",
    name: "Colorful",
    description: "Bold candy-colored border for playful shots.",
    borderColor: "#FFFFFF",
    accentColor: "#E8A33D",
    bottomHeight: 0.26,
    borderWidth: 16,
    rotationJitter: 5,
  },
  {
    id: "torn-paper",
    name: "Torn Paper",
    description: "Hand-torn scrapbook edges, deckled and rough.",
    borderColor: "#F6EFE0",
    bottomHeight: 0.3,
    borderWidth: 22,
    rotationJitter: 6,
    tornEdges: true,
    paperTexture: true,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Thin, quiet border for modern minimalists.",
    borderColor: "#FFFFFF",
    bottomHeight: 0.14,
    borderWidth: 8,
    rotationJitter: 1,
  },
  {
    id: "film-strip",
    name: "Film Strip",
    description: "35mm sprocket holes and black leader.",
    borderColor: "#1B1917",
    bottomHeight: 0.16,
    borderWidth: 14,
    rotationJitter: 0,
    filmSprockets: true,
  },
];

export const FILTERS: FilterDef[] = [
  { id: "original", name: "Original", css: "none" },
  { id: "bw", name: "Black & White", css: "grayscale(1) contrast(1.05)" },
  { id: "sepia", name: "Sepia", css: "sepia(0.75) contrast(1.05) saturate(1.1)" },
  { id: "vintage", name: "Vintage", css: "saturate(0.75) sepia(0.25) contrast(0.95) brightness(1.05)" },
  { id: "retro-film", name: "Retro Film", css: "contrast(1.15) saturate(1.3) hue-rotate(-6deg) brightness(0.98)", overlay: "grain" },
  { id: "warm", name: "Warm", css: "saturate(1.15) sepia(0.15) brightness(1.05)" },
  { id: "cool", name: "Cool", css: "saturate(1.05) hue-rotate(12deg) brightness(1.02)" },
  { id: "vibrant", name: "Bright & Vibrant", css: "saturate(1.5) contrast(1.1) brightness(1.06)" },
  { id: "film-grain", name: "Film Grain", css: "contrast(1.05) saturate(0.95)", overlay: "grain" },
  { id: "light-leaks", name: "Light Leaks", css: "contrast(1.05) saturate(1.2)", overlay: "leaks" },
  { id: "dust-scratch", name: "Dust & Scratch", css: "contrast(1.02) saturate(0.85) sepia(0.1)", overlay: "dust" },
  { id: "disposable", name: "Disposable Camera", css: "saturate(1.35) contrast(1.1) brightness(1.1) hue-rotate(-3deg)", overlay: "disposable-flash" },
];

export const DISPLAY_FONTS = [
  { id: "caveat", name: "Caveat (Handwriting)", family: "var(--font-caveat)", handwriting: true },
  { id: "kalam", name: "Kalam (Handwriting)", family: "var(--font-kalam)", handwriting: true },
  { id: "shadows", name: "Shadows Into Light", family: "var(--font-shadows)", handwriting: true },
  { id: "permanent-marker", name: "Permanent Marker", family: "var(--font-marker)", handwriting: true },
  { id: "fraunces", name: "Fraunces (Serif)", family: "var(--font-fraunces)", handwriting: false },
  { id: "space-mono", name: "Space Mono (Typewriter)", family: "var(--font-space-mono)", handwriting: false },
  { id: "inter", name: "Inter (Clean)", family: "var(--font-inter)", handwriting: false },
];

/**
 * Canvas 2D's `ctx.font` can't resolve CSS custom properties like
 * `var(--font-caveat)` — it needs the real @fontsource family name. This
 * maps the CSS-var string used throughout the UI to the actual font name,
 * for use only in the native export renderer (lib/canvas/renderProject.ts).
 */
export const CANVAS_FONT_NAMES: Record<string, string> = {
  "var(--font-caveat)": "Caveat",
  "var(--font-kalam)": "Kalam",
  "var(--font-shadows)": "Shadows Into Light",
  "var(--font-marker)": "Permanent Marker",
  "var(--font-fraunces)": "Fraunces",
  "var(--font-space-mono)": "Space Mono",
  "var(--font-inter)": "Inter",
};

export const STICKERS: { category: string; items: string[] }[] = [
  { category: "Faces", items: ["😊", "😂", "🥰", "😎", "🤩", "😭", "🥳", "😴"] },
  { category: "Love", items: ["❤️", "💛", "💕", "💖", "💌", "🌹", "✨", "💫"] },
  { category: "Travel", items: ["✈️", "🗺️", "🏝️", "🏔️", "🎒", "🧳", "🚗", "🏕️"] },
  { category: "Nature", items: ["🌻", "🌸", "🍂", "🌈", "☀️", "🌙", "⭐", "🍀"] },
  { category: "Party", items: ["🎉", "🎂", "🎈", "🎁", "🍾", "🎊", "🥂", "🎵"] },
  { category: "Misc", items: ["📷", "📌", "✂️", "🔖", "🧷", "📎", "🖇️", "🪶"] },
];

export const WASHI_TAPES = [
  { id: "amber", color: "#E8A33D", pattern: "solid" },
  { id: "coral", color: "#C1503F", pattern: "solid" },
  { id: "sage", color: "#7C8B6F", pattern: "solid" },
  { id: "dot-cream", color: "#F6EFE0", pattern: "dots" },
  { id: "stripe-navy", color: "#3B4A5A", pattern: "stripe" },
  { id: "check-rust", color: "#B5673A", pattern: "check" },
];

export const BACKGROUND_PATTERNS = [
  { id: "none", name: "None" },
  { id: "kraft", name: "Kraft Paper" },
  { id: "grid", name: "Notebook Grid" },
  { id: "linen", name: "Linen Texture" },
  { id: "cork", name: "Corkboard" },
  { id: "floral", name: "Soft Floral" },
];

export const SCRAPBOOK_TEMPLATES: ScrapbookTemplate[] = [
  { id: "birthday-1", name: "Birthday Bash", category: "birthday", thumb: "/templates/birthday.svg", slotCount: 4 },
  { id: "travel-1", name: "Road Trip Journal", category: "travel", thumb: "/templates/travel.svg", slotCount: 6 },
  { id: "grad-1", name: "Class of Memories", category: "graduation", thumb: "/templates/graduation.svg", slotCount: 5 },
  { id: "wedding-1", name: "Forever Day", category: "wedding", thumb: "/templates/wedding.svg", slotCount: 4 },
  { id: "festival-1", name: "Festival Nights", category: "festival", thumb: "/templates/festival.svg", slotCount: 6 },
  { id: "journal-1", name: "Everyday Journal", category: "journal", thumb: "/templates/journal.svg", slotCount: 3 },
];

export const CAPSULE_PRESETS = [
  { id: "1m", label: "1 Month", days: 30 },
  { id: "6m", label: "6 Months", days: 182 },
  { id: "1y", label: "1 Year", days: 365 },
  { id: "custom", label: "Custom Date", days: 0 },
];
