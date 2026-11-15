import { PolaroidProject } from "@/types";
import { FRAME_TEMPLATES, WASHI_TAPES, CANVAS_FONT_NAMES } from "@/lib/constants";
import { buildFilterCss, getOverlayForFilter } from "@/lib/canvas/filters";

const CARD_WIDTH = 360;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't load the photo for export."));
    img.src = src;
  });
}

function resolveFont(cssVarFamily: string): string {
  return CANVAS_FONT_NAMES[cssVarFamily] || "Inter";
}

/** Draws `img` into a `size`x`size` square using the same crop math as CSS `object-fit: cover`. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, size: number) {
  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const rawLine of text.split("\n")) {
    let line = "";
    const words = rawLine.split(" ");
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Renders the current PolaroidCard to an offscreen canvas by drawing it
 * natively rather than snapshotting the live DOM. This is what makes CSS
 * filters, the caption textarea's current text, and the doodle layer all
 * export correctly and predictably at any resolution.
 */
export async function renderPolaroidToCanvas(
  project: PolaroidProject,
  doodleCanvasSource: HTMLCanvasElement | null,
  scale = 3
): Promise<HTMLCanvasElement> {
  const frame = FRAME_TEMPLATES.find((f) => f.id === project.frameTemplate);
  if (!frame) throw new Error("Unknown frame template.");
  if (!project.imageSrc) throw new Error("Add a photo before exporting.");

  const bottomHeight = Math.round(CARD_WIDTH * frame.bottomHeight);
  const photoSize = CARD_WIDTH - frame.borderWidth * 2;
  const totalHeight = frame.borderWidth + photoSize + bottomHeight;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(CARD_WIDTH * scale);
  canvas.height = Math.round(totalHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser doesn't support canvas export.");
  ctx.scale(scale, scale);

  // Wait for @fontsource web fonts to be ready so text metrics are correct.
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      /* non-fatal — falls back to default font metrics */
    }
  }

  // --- Frame background ---
  ctx.fillStyle = frame.borderColor;
  ctx.fillRect(0, 0, CARD_WIDTH, totalHeight);
  if (frame.accentColor) {
    ctx.fillStyle = frame.accentColor;
    ctx.fillRect(0, 0, CARD_WIDTH, 8);
  }

  const wellX = frame.borderWidth;
  const wellY = frame.borderWidth;

  // --- Photo ---
  ctx.save();
  ctx.beginPath();
  ctx.rect(wellX, wellY, photoSize, photoSize);
  ctx.clip();
  ctx.fillStyle = "#d8d0bc";
  ctx.fillRect(wellX, wellY, photoSize, photoSize);

  const img = await loadImage(project.imageSrc);
  const filterCss = buildFilterCss(project.filter, project.adjustments);
  ctx.save();
  ctx.translate(wellX + photoSize / 2 + project.transform.offsetX, wellY + photoSize / 2 + project.transform.offsetY);
  ctx.rotate((project.transform.rotation * Math.PI) / 180);
  ctx.scale(project.transform.zoom, project.transform.zoom);
  if (filterCss !== "none") ctx.filter = filterCss;
  drawCover(ctx, img, photoSize);
  ctx.restore();

  // --- Filter overlay textures (grain / light leaks / dust / flash) ---
  const overlay = getOverlayForFilter(project.filter);
  drawOverlay(ctx, overlay, wellX, wellY, photoSize);

  // --- Vignette ---
  if (project.adjustments.vignette > 0) {
    const strength = project.adjustments.vignette / 100;
    const grad = ctx.createRadialGradient(
      wellX + photoSize / 2,
      wellY + photoSize / 2,
      photoSize * 0.35,
      wellX + photoSize / 2,
      wellY + photoSize / 2,
      photoSize * 0.72
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, `rgba(0,0,0,${0.55 * strength})`);
    ctx.fillStyle = grad;
    ctx.fillRect(wellX, wellY, photoSize, photoSize);
  }

  // --- Doodle layer (live Fabric.js canvas) ---
  if (doodleCanvasSource) {
    try {
      ctx.drawImage(doodleCanvasSource, wellX, wellY, photoSize, photoSize);
    } catch {
      /* non-fatal — doodle just won't appear in the export */
    }
  }

  // --- Decorations (stickers + washi tape) ---
  for (const d of project.decorations) {
    ctx.save();
    ctx.translate(wellX + (d.x / 100) * photoSize, wellY + (d.y / 100) * photoSize);
    ctx.rotate((d.rotation * Math.PI) / 180);
    ctx.scale(d.scale, d.scale);
    if (d.type === "sticker") {
      ctx.font = "38px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(d.value, 0, 0);
    } else if (d.type === "washi") {
      const tape = WASHI_TAPES.find((t) => t.id === d.value);
      ctx.fillStyle = tape?.color ?? "#E8A33D";
      ctx.globalAlpha = 0.9;
      ctx.fillRect(-48, -12, 96, 24);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  ctx.restore(); // end photo-well clip

  if (frame.filmSprockets) {
    ctx.fillStyle = frame.borderColor;
    for (let y = wellY + 6; y < wellY + photoSize - 6; y += 22) {
      ctx.beginPath();
      ctx.arc(wellX + 6, y, 3, 0, Math.PI * 2);
      ctx.arc(wellX + photoSize - 6, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Caption strip ---
  const captionTop = wellY + photoSize;
  let cursorY = captionTop + 18;
  const { caption, stamps } = project;
  if (caption.text) {
    ctx.fillStyle = caption.color;
    ctx.font = `${caption.fontWeight >= 700 ? "bold " : ""}${caption.fontSize}px ${resolveFont(caption.fontFamily)}`;
    ctx.textBaseline = "top";
    const maxWidth = CARD_WIDTH - 24;
    const lines = wrapText(ctx, caption.text, maxWidth);
    const lineHeight = caption.fontSize * 1.15;
    const alignX = caption.align === "left" ? 12 : caption.align === "right" ? CARD_WIDTH - 12 : CARD_WIDTH / 2;
    ctx.textAlign = caption.align;
    lines.forEach((line, i) => ctx.fillText(line, alignX, cursorY + i * lineHeight, maxWidth));
    cursorY += lines.length * lineHeight + 4;
  }

  const stampParts: string[] = [];
  if (stamps.dateStamp) {
    const d = new Date(stamps.customDate || project.updatedAt);
    stampParts.push(
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()
    );
  }
  if (stamps.locationStamp && stamps.locationText) stampParts.push(stamps.locationText.toUpperCase());
  if (stampParts.length) {
    ctx.fillStyle = "rgba(107,101,91,0.85)";
    ctx.font = "10px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(stampParts.join("   ·   "), CARD_WIDTH / 2, cursorY);
    cursorY += 16;
  }

  if (stamps.signature) {
    ctx.fillStyle = caption.color;
    ctx.font = `18px ${resolveFont(stamps.signatureFont)}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(stamps.signature, CARD_WIDTH / 2, cursorY);
  }

  return canvas;
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: string | undefined,
  x: number,
  y: number,
  size: number
) {
  if (!overlay) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, size, size);
  ctx.clip();

  if (overlay === "leaks") {
    ctx.globalCompositeOperation = "screen";
    const g1 = ctx.createRadialGradient(x + size * 0.85, y + size * 0.1, 0, x + size * 0.85, y + size * 0.1, size * 0.5);
    g1.addColorStop(0, "rgba(255,150,60,0.55)");
    g1.addColorStop(1, "rgba(255,150,60,0)");
    ctx.fillStyle = g1;
    ctx.fillRect(x, y, size, size);
    const g2 = ctx.createRadialGradient(x + size * 0.05, y + size * 0.95, 0, x + size * 0.05, y + size * 0.95, size * 0.55);
    g2.addColorStop(0, "rgba(255,60,120,0.35)");
    g2.addColorStop(1, "rgba(255,60,120,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(x, y, size, size);
  } else if (overlay === "disposable-flash") {
    ctx.globalCompositeOperation = "screen";
    const g = ctx.createRadialGradient(x + size * 0.5, y + size * 0.4, 0, x + size * 0.5, y + size * 0.4, size * 0.65);
    g.addColorStop(0, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, size, size);
  } else if (overlay === "grain" || overlay === "dust") {
    // Lightweight procedural speckle — approximates the SVG turbulence/dust
    // texture used in the live preview without needing an extra asset.
    ctx.globalAlpha = overlay === "grain" ? 0.12 : 0.18;
    ctx.fillStyle = "#000000";
    const density = overlay === "grain" ? 900 : 220;
    let seed = 42;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < density; i++) {
      const px = x + rand() * size;
      const py = y + rand() * size;
      const r = overlay === "grain" ? rand() * 0.6 : rand() * 1.2 + 0.4;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

export type ExportFormat = "png" | "jpg" | "pdf";

export async function exportProject(
  project: PolaroidProject,
  doodleCanvasSource: HTMLCanvasElement | null,
  format: ExportFormat,
  filename: string,
  scale = 3
) {
  const canvas = await renderPolaroidToCanvas(project, doodleCanvasSource, scale);

  if (format === "pdf") {
    const { jsPDF } = await import("jspdf");
    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
    return;
  }

  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const dataUrl = canvas.toDataURL(mime, 0.95);
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${filename}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
