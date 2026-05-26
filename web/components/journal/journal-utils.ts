import type { CSSProperties } from "react";

const TORN_CLIP =
  "polygon(0 0, 100% 0, 100% 92%, 97% 95%, 94% 91%, 91% 96%, 88% 92%, 85% 97%, 82% 93%, 79% 97%, 76% 92%, 73% 96%, 70% 91%, 67% 95%, 64% 91%, 61% 96%, 58% 92%, 55% 96%, 52% 91%, 49% 95%, 46% 92%, 43% 96%, 40% 91%, 37% 95%, 34% 92%, 31% 96%, 28% 91%, 25% 95%, 22% 92%, 19% 96%, 16% 91%, 13% 95%, 10% 92%, 7% 96%, 4% 91%, 0 95%)";

const CARD_ROTATIONS = [-1.5, 0.8, -0.5, 1.2] as const;
const CARD_BACKGROUNDS = ["#1c1c1c", "#1a1a1a", "#222222"] as const;

export function getTornClipPath(): string {
  return TORN_CLIP;
}

export function getCardRotation(index: number): number {
  return CARD_ROTATIONS[index % CARD_ROTATIONS.length];
}

export function getCardBackground(index: number): string {
  return CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length];
}

/** Non-uniform 3-column grid placement — 7-card repeating pattern */
export function getGridPlacement(index: number): {
  className: string;
  style?: CSSProperties;
} {
  const pos = index % 7;
  const cycle = Math.floor(index / 7);
  const rowOffset = cycle * 5;

  switch (pos) {
    case 0:
      return {
        className: "col-span-2 lg:col-span-2",
        style: { gridRow: `${rowOffset + 1} / span 1` },
      };
    case 1:
      return {
        className: "col-span-1 lg:col-span-1",
        style: { gridRow: `${rowOffset + 1} / span 2` },
      };
    case 2:
      return {
        className: "col-span-1",
        style: { gridRow: `${rowOffset + 2} / span 1` },
      };
    case 3:
      return {
        className: "col-span-1",
        style: { gridRow: `${rowOffset + 2} / span 1` },
      };
    case 4:
      return {
        className: "col-span-1",
        style: { gridRow: `${rowOffset + 2} / span 1` },
      };
    case 5:
      return {
        className: "col-span-1",
        style: { gridRow: `${rowOffset + 3} / span 2` },
      };
    case 6:
      return {
        className: "col-span-2",
        style: { gridRow: `${rowOffset + 3} / span 1` },
      };
    default:
      return { className: "col-span-1" };
  }
}
