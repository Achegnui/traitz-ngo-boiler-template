// Visual baseline tool. Usage: npm run shots -- <label>   (server must be running: npm run start)
// Offline Chromium comes from @sparticuz/chromium; falls back to a locally installed Playwright browser.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const label = process.argv[2] ?? "current";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const out = `.shots/${label}`;
mkdirSync(out, { recursive: true });

const routes = ["/en", "/fr", "/en/about", "/en/programmes", "/en/programmes/wum-water-project", "/en/stories", "/en/news",
  "/en/events", "/en/reports", "/en/team", "/en/donate", "/en/contact", "/admin/login"];
const sizes = [390, 1280];

async function launch() {
  try {
    const { default: sp } = await import("@sparticuz/chromium");
    return await chromium.launch({ executablePath: await sp.executablePath(), args: sp.args, headless: true });
  } catch { return chromium.launch({ headless: true }); }
}

const name = (r, w) => `${(r.replace(/^\//, "").replace(/\//g, "_") || "root")}-${w}.png`;
for (const width of sizes) {
  const browser = await launch(); // one browser per width: the bundled Chromium runs single-process
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const shot = async (r) => {
    await page.goto(base + r, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${out}/${name(r, width)}`, fullPage: true, animations: "disabled" });
    console.log("shot", name(r, width));
  };
  for (const r of routes) await shot(r);
  // admin dashboard: same login flow as the fake backend (admin@example.test / demo-pass-1)
  await page.goto(base + "/admin/login", { waitUntil: "networkidle" });
  await page.fill("#email", "admin@example.test");
  await page.fill("#password", "demo-pass-1");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin/dashboard");
  await shot("/admin/dashboard");
  await ctx.close();
  await browser.close();
}
