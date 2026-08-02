export type RememberPortraitMode = "photo" | "cutout" | "crest";

export type RememberPortrait = {
  src: string;
  mode: RememberPortraitMode;
  scale: number;
  offsetY: number;
};

const rememberPortraits: Record<string, Omit<RememberPortrait, "mode"> & {mode?: RememberPortraitMode}> = {
  "ronnie-white": { src: "/assets/remember/ronnie-white.webp", scale: 1.18, offsetY: 4 },
  "jonis-warren": { src: "/assets/remember/jonis-warren.webp", scale: 1.2, offsetY: 5 },
  "lelia-henderson": { src: "/assets/remember/lelia-henderson.webp", scale: 1.06, offsetY: 3 },
  "deloris-holden": { src: "/assets/remember/deloris-holden.webp", scale: 1.18, offsetY: 5 },
  "brandon-mckay": { src: "/assets/remember/brandon-mckay.webp", scale: 1.08, offsetY: 3 },
  "richard-gross": { src: "/assets/memorials/richard-gross-cutout.webp", scale: 1.34, offsetY: 8 },
  "keiaris-tilman": { src: "/logo.png", mode: "crest", scale: 0.74, offsetY: -1 },
  "troyshaun-martin": { src: "/assets/remember/troyshaun-martin.webp", scale: 1.04, offsetY: 3 },
  "steven-dillon": { src: "/assets/remember/steven-dillon.webp", scale: 1.06, offsetY: 3 },
};

export function getRememberPortrait(slug: string, fallbackSrc: string | null): RememberPortrait | null {
  const override = rememberPortraits[slug];
  if (override) {
    return { mode: override.mode ?? "cutout", ...override };
  }

  if (!fallbackSrc) return null;
  return { src: fallbackSrc, mode: "photo", scale: 1, offsetY: 0 };
}