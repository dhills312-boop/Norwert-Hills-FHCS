import type { CSSProperties } from "react";
import type { PortraitCrop } from "@shared/schema";

const DEFAULT_CROP: Required<PortraitCrop> = {
  x: 50,
  y: 28,
  scale: 1,
};

export function normalizePortraitCrop(crop?: PortraitCrop | null): Required<PortraitCrop> {
  return {
    x: crop?.x ?? DEFAULT_CROP.x,
    y: crop?.y ?? DEFAULT_CROP.y,
    scale: crop?.scale ?? DEFAULT_CROP.scale,
  };
}

export function portraitCropStyle(crop?: PortraitCrop | null): CSSProperties {
  const normalized = normalizePortraitCrop(crop);

  return {
    objectPosition: `${normalized.x}% ${normalized.y}%`,
    transform: `scale(${normalized.scale})`,
  };
}