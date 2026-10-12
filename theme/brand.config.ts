export type Palette = { anchor: string; accent: string; tint: string; ink: string; muted: string };

export const presets = {
  default: { anchor: "#0b1220", accent: "#f5a623", tint: "#f6f1e7", ink: "#0b1220", muted: "#5b6478" },
  forest: { anchor: "#10261c", accent: "#e8b04a", tint: "#f3f6f1", ink: "#10261c", muted: "#55645b" },
  navy: { anchor: "#0a1a33", accent: "#ff7a3d", tint: "#f2f5fa", ink: "#0a1a33", muted: "#566179" },
  terracotta: { anchor: "#2a1712", accent: "#e2703a", tint: "#faf4f0", ink: "#2a1712", muted: "#6b5a54" },
} satisfies Record<string, Palette>;

export const brand = {
  name: "Traitz",
  suffix: "Foundation",
  preset: "default" as keyof typeof presets,
  overrides: {} as Partial<Palette>,
  fonts: { display: "bricolage" as "bricolage" | "fraunces" },
};

export const palette = (): Palette => ({ ...presets[brand.preset], ...brand.overrides });
export const siteName = () => `${brand.name} ${brand.suffix}`;

export function themeVars(): Record<string, string> {
  const p = palette();
  return {
    "--brand-anchor": p.anchor, "--brand-accent": p.accent, "--brand-tint": p.tint,
    "--brand-ink": p.ink, "--brand-muted": p.muted,
    "--font-display-active": `var(--font-${brand.fonts.display})`,
  };
}
