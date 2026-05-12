/** Deterministic palette index from seed (FNV-1a-ish). */
export function hashStringToPaletteIndex(seed: string, paletteLength: number): number {
  let h = 2166136261;
  const s = seed.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % paletteLength;
}

/** Six Winter Chill–friendly pairs (bg + readable fg). */
export const LETTER_AVATAR_SWATCHES = [
  { bg: "#2d5f66", fg: "#E8F7FA" },
  { bg: "#4F7C82", fg: "#0B2E33" },
  { bg: "#35605c", fg: "#d8c470" },
  { bg: "#3d5a70", fg: "#B8E3E9" },
  { bg: "#5c4d68", fg: "#E8DCF5" },
  { bg: "#6b5644", fg: "#f0e6d2" },
] as const;

export function letterAvatarSwatch(seed: string): (typeof LETTER_AVATAR_SWATCHES)[number] {
  const i = hashStringToPaletteIndex(seed, LETTER_AVATAR_SWATCHES.length);
  return LETTER_AVATAR_SWATCHES[i];
}
