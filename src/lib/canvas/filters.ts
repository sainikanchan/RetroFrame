import { Adjustments, FilterId } from "@/types";
import { FILTERS } from "@/lib/constants";

/** Map -100..100 adjustment sliders onto sensible CSS filter ranges. */
export function adjustmentsToCss(a: Adjustments): string {
  const brightness = 1 + a.brightness / 130 + a.exposure / 160;
  const contrast = 1 + a.contrast / 120;
  const saturate = 1 + a.saturation / 100;
  const blurPx = (a.blur / 100) * 8;
  // "Sharpness" has no native CSS filter equivalent; we fake perceived
  // sharpness by nudging contrast + saturation slightly, applied by caller.
  const sharpBoost = a.sharpness > 0 ? a.sharpness / 400 : 0;

  return [
    `brightness(${Math.max(0.2, brightness).toFixed(3)})`,
    `contrast(${Math.max(0.2, contrast + sharpBoost).toFixed(3)})`,
    `saturate(${Math.max(0, saturate).toFixed(3)})`,
    blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function temperatureToCss(temperature: number): string {
  // Warm = amber tint, Cool = blue tint, achieved with hue-rotate + sepia trick.
  if (temperature === 0) return "";
  if (temperature > 0) {
    return `sepia(${Math.min(0.4, temperature / 250)}) saturate(${1 + temperature / 300})`;
  }
  return `hue-rotate(${(temperature / 100) * 25}deg)`;
}

export function buildFilterCss(filterId: FilterId, adjustments: Adjustments): string {
  const preset = FILTERS.find((f) => f.id === filterId)?.css ?? "none";
  const presetCss = preset === "none" ? "" : preset;
  const adjustCss = adjustmentsToCss(adjustments);
  const tempCss = temperatureToCss(adjustments.temperature);
  return [presetCss, adjustCss, tempCss].filter(Boolean).join(" ") || "none";
}

export function getOverlayForFilter(filterId: FilterId) {
  return FILTERS.find((f) => f.id === filterId)?.overlay;
}
