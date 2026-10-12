/**
 * Generates the topographic contour backgrounds in /public/art (npm run art).
 * Closed, wobbling rings around a few hill centres, like a survey map of the Grassfields.
 */
import { writeFileSync } from "node:fs";

function rng(seed: number) { let a = seed; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function ring(cx: number, cy: number, r: number, wob: number[][], k: number): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    let rr = r;
    for (const [f, amp, ph] of wob) rr += Math.sin(a * f + ph + k * 0.18) * amp * (0.6 + r / 500);
    pts.push([cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr * 0.8]);
  }
  // Catmull-Rom to cubic Bezier
  const f = (n: number) => Math.round(n);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length], p1 = pts[i], p2 = pts[(i + 1) % pts.length], p3 = pts[(i + 2) % pts.length];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

function art(seed: number, stroke: string, opacity: number): string {
  const r = rng(seed);
  const hills = [[0.28, 0.45], [0.72, 0.62], [0.55, 0.2]].map(([x, y]) => [x * 1600 + (r() - 0.5) * 160, y * 900 + (r() - 0.5) * 120]);
  let paths = "";
  hills.forEach(([cx, cy], h) => {
    const wob = [[2, 14 + r() * 10, r() * 6], [3, 9 + r() * 8, r() * 6], [5, 5 + r() * 5, r() * 6]];
    for (let k = 1; k <= 9; k++) paths += `<path d="${ring(cx, cy, 30 + k * 40 + h * 8, wob, k)}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="1.4">${paths}</g></svg>`;
}

for (const [name, seed, stroke, op] of [["c-light", 11, "#ffffff", 0.2], ["c-dark", 11, "#0b1220", 0.09]] as const) {
  const svg = art(seed, stroke, op);
  writeFileSync(`public/art/${name}.svg`, svg);
  console.log(name, (svg.length / 1024).toFixed(1) + " KB");
}
