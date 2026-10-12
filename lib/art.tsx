import type { ReactElement } from "react";

/**
 * Illustrated stand-ins for photographs: layered "paper-cut" landscapes with one motif each, generated
 * from a seed so every image is different but always the same. They are placeholders by design: the
 * moment a real photo is uploaded (or dropped into /public/photos) it replaces them.
 */
export const ART_MOTIFS = ["water", "school", "seed", "health", "community", "report", "portrait", "events"] as const;
export type ArtMotif = (typeof ART_MOTIFS)[number];
export type ArtRef = { motif: ArtMotif; seed?: number };

// sky, far hill, mid hill, near hill, ground, accent
const PALETTES: Record<ArtMotif, string[]> = {
  water:     ["#dfeee9", "#a9cfc4", "#6fae9f", "#3f8577", "#235a52", "#f5a623"],
  school:    ["#f6e3d1", "#e5b894", "#cf8d62", "#a9623f", "#6e3a27", "#f5a623"],
  seed:      ["#e9efd0", "#c5d58d", "#93b25a", "#5f8a3a", "#385a28", "#f5a623"],
  health:    ["#f6dcd9", "#e8b3ae", "#d3837f", "#a9524f", "#6b2e30", "#f7f0e6"],
  community: ["#f4e6c3", "#e8c77e", "#cf9a47", "#a06a2c", "#5f3d1c", "#fff6e0"],
  report:    ["#dde5ee", "#b4c4d8", "#8aa1bf", "#5b7597", "#35496a", "#f5a623"],
  portrait:  ["#efe7dc", "#dccfbd", "#c4b199", "#a28d72", "#6d5c48", "#f5a623"],
  events:    ["#f1dfe9", "#dcb3c9", "#bf88a8", "#8f5679", "#583349", "#f5a623"],
};

// Portraits rotate through three palettes so a team page does not look like one picture repeated.
const PORTRAIT_PALETTES = [
  PALETTES.portrait,
  ["#e3ecdf", "#c3d6bd", "#9db996", "#6f9372", "#3e5f47", "#f5a623"],
  ["#e1e6f0", "#bfc9e0", "#97a6cb", "#6c7fae", "#41507c", "#f5a623"],
  ["#f3e0dc", "#e3bcb3", "#cd9488", "#a46a5f", "#6a3f38", "#f5a623"],
];

function rng(seed: number) {
  let a = seed >>> 0 || 1;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function hill(r: () => number, base: number, amp: number): string {
  const p1 = r() * 6.28, p2 = r() * 6.28, f1 = 0.004 + r() * 0.003, f2 = 0.011 + r() * 0.006;
  let d = `M0 600 L0 ${Math.round(base)}`;
  for (let x = 0; x <= 800; x += 20) d += ` L${x} ${Math.round(base + Math.sin(x * f1 + p1) * amp + Math.sin(x * f2 + p2) * amp * 0.35)}`;
  return d + " L800 600 Z";
}

function motifShapes(m: ArtMotif, c: string[], r: () => number): ReactElement {
  const dark = c[4], light = c[0], acc = c[5];
  switch (m) {
    case "water":
      return (
        <g>
          <ellipse cx="520" cy="505" rx="96" ry="14" fill={dark} opacity=".35" />
          <ellipse cx="520" cy="505" rx="62" ry="8" fill="none" stroke={light} strokeWidth="2" opacity=".8" />
          <ellipse cx="520" cy="505" rx="34" ry="4.5" fill="none" stroke={light} strokeWidth="2" opacity=".9" />
          <rect x="438" y="330" width="26" height="175" rx="4" fill={dark} />
          <path d="M451 340 h84 q22 0 22 22 v14 h-22 v-12 q0 -6 -6 -6 h-78 z" fill={dark} />
          <rect x="425" y="498" width="52" height="14" rx="3" fill={dark} />
          <path d="M546 392 q-13 22 0 32 q13 -10 0 -32 z" fill={acc} />
          <circle cx="150" cy="130" r="46" fill={acc} opacity=".9" />
        </g>
      );
    case "school":
      return (
        <g>
          <rect x="300" y="380" width="220" height="130" fill={light} />
          <path d="M280 384 L410 300 L540 384 Z" fill={dark} />
          <rect x="392" y="440" width="36" height="70" rx="3" fill={dark} />
          <rect x="326" y="412" width="36" height="34" fill={acc} /><rect x="458" y="412" width="36" height="34" fill={acc} />
          <path d="M600 510 V330" stroke={dark} strokeWidth="5" /><path d="M602 332 h56 l-14 16 l14 16 h-56 z" fill={acc} />
          <circle cx="650" cy="120" r="44" fill={acc} opacity=".9" />
        </g>
      );
    case "seed":
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 250 + i * 70, h = 70 + r() * 90;
            return (
              <g key={i}>
                <path d={`M${x} 520 q${r() * 16 - 8} -${h / 2} 0 -${h}`} stroke={dark} strokeWidth="5" fill="none" strokeLinecap="round" />
                <ellipse cx={x - 22} cy={510 - h * 0.7} rx="24" ry="11" transform={`rotate(-28 ${x - 22} ${510 - h * 0.7})`} fill={acc} opacity={0.95} />
                <ellipse cx={x + 22} cy={510 - h * 0.95} rx="24" ry="11" transform={`rotate(28 ${x + 22} ${510 - h * 0.95})`} fill={c[2]} />
              </g>
            );
          })}
          <circle cx="640" cy="120" r="42" fill={acc} opacity=".9" />
        </g>
      );
    case "health":
      return (
        <g>
          <rect x="300" y="360" width="260" height="150" rx="6" fill={light} />
          <path d="M280 366 L430 296 L580 366 Z" fill={dark} />
          <rect x="406" y="408" width="48" height="16" fill={c[3]} /><rect x="422" y="392" width="16" height="48" fill={c[3]} />
          <rect x="396" y="460" width="68" height="50" rx="3" fill={dark} />
          <circle cx="160" cy="130" r="42" fill={c[1]} />
        </g>
      );
    case "community":
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => {
            const x = 270 + i * 62, h = 70 + ((i * 37) % 28);
            return (
              <g key={i} fill={i % 2 ? dark : c[3]}>
                <circle cx={x} cy={500 - h - 18} r="16" /><path d={`M${x - 20} 512 q0 -${h} 20 -${h} q20 0 20 ${h} z`} />
              </g>
            );
          })}
          <circle cx="620" cy="120" r="44" fill={acc} opacity=".95" />
        </g>
      );
    case "report":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${330 + i * 22} ${330 + i * 14}) rotate(${-6 + i * 5})`}>
              <rect width="170" height="210" rx="6" fill={i === 2 ? "#fff" : light} stroke={dark} strokeOpacity=".25" />
              {i === 2 && [0, 1, 2, 3, 4, 5].map((l) => <rect key={l} x="18" y={26 + l * 24} width={l === 0 ? 70 : 134 - (l % 3) * 18} height="8" rx="4" fill={l === 0 ? acc : dark} opacity={l === 0 ? 1 : 0.55} />)}
            </g>
          ))}
        </g>
      );
    case "portrait":
      return (
        <g>
          <circle cx="400" cy="300" r="78" fill={dark} /><path d="M230 600 q0 -190 170 -190 q170 0 170 190 z" fill={dark} />
          <circle cx="400" cy="300" r="78" fill="none" stroke={acc} strokeWidth="4" transform="translate(10 10)" opacity=".9" />
        </g>
      );
    case "events":
      return (
        <g>
          <rect x="300" y="330" width="220" height="180" rx="8" fill={light} /><rect x="300" y="330" width="220" height="48" rx="8" fill={dark} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={324 + (i % 4) * 46} y={398 + Math.floor(i / 4) * 50} width="30" height="30" rx="5" fill={i === 5 ? acc : c[2]} opacity={i === 5 ? 1 : 0.55} />)}
          <rect x="336" y="312" width="10" height="36" rx="4" fill={acc} /><rect x="474" y="312" width="10" height="36" rx="4" fill={acc} />
        </g>
      );
  }
}

export function ArtSvg({ art, className }: { art: ArtRef; className?: string }) {
  const c = art.motif === "portrait" ? PORTRAIT_PALETTES[(art.seed ?? 1) % PORTRAIT_PALETTES.length] : (PALETTES[art.motif] ?? PALETTES.community);
  const r = rng((art.seed ?? 1) * 7919 + art.motif.length * 131);
  return (
    <svg className={className} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="800" height="600" fill={c[0]} />
      <path d={hill(r, 330 + r() * 40, 36)} fill={c[1]} />
      <path d={hill(r, 400 + r() * 30, 30)} fill={c[2]} />
      <path d={hill(r, 470 + r() * 24, 24)} fill={c[3]} />
      <rect y="515" width="800" height="85" fill={c[4]} />
      {motifShapes(art.motif, c, r)}
    </svg>
  );
}
