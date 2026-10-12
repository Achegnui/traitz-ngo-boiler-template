import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * shadcn/ui class merger: clsx for conditionals, tailwind-merge so later utilities win.
 * Tailwind v4 arbitrary sizes like text-[11px] do not set a line-height, so a font size no longer cancels `leading-*`.
 */
const twMerge = extendTailwindMerge({ override: { conflictingClassGroups: { "font-size": [] } } });
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import type { CSSProperties } from "react";
import type { Programme } from "@/lib/types";

export type Grad = readonly [string, string];
export const gradVar = (g: Grad): CSSProperties =>
  ({ "--g": `linear-gradient(135deg, ${g[0]}, ${g[1]})` }) as CSSProperties;

/** Progress is derived from fundingRaised / fundingGoal, never stored. */
export function fundingPercent(p: Pick<Programme, "fundingGoal" | "fundingRaised">): number | null {
  if (!p.fundingGoal || p.fundingGoal <= 0) return null;
  return Math.min(100, Math.round(((p.fundingRaised ?? 0) / p.fundingGoal) * 100));
}

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
