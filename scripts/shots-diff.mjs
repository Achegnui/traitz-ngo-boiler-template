// Usage: npm run shots:diff [-- route-prefix ...]   compares .shots/baseline with .shots/current
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const filters = process.argv.slice(2);
const A = ".shots/baseline", B = ".shots/current", D = ".shots/diff";
mkdirSync(D, { recursive: true });
let worst = 0;
for (const f of readdirSync(A).filter((f) => f.endsWith(".png") && (!filters.length || filters.some((p) => f.startsWith(p))))) {
  if (!existsSync(`${B}/${f}`)) { console.log(`${f}: MISSING in current`); continue; }
  const a = PNG.sync.read(readFileSync(`${A}/${f}`)), b = PNG.sync.read(readFileSync(`${B}/${f}`));
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`${f}: SIZE ${a.width}x${a.height} vs ${b.width}x${b.height} (page height changed)`); worst = 100; continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  const pct = (n / (a.width * a.height)) * 100;
  worst = Math.max(worst, pct);
  if (pct > 0) writeFileSync(`${D}/${f}`, PNG.sync.write(diff));
  console.log(`${f}: ${pct.toFixed(3)}%${pct > 0.5 ? "  <-- OVER 0.5%" : ""}`);
}
console.log(`worst: ${worst.toFixed(3)}%`);
