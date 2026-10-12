// Admin smoke test (confirm dialog, EN/FR tabs, toast, Radix select). Usage: npm run smoke:admin (server running on :3000, fake admin backend).
import { chromium } from "playwright";
import sp from "@sparticuz/chromium";
const b = await chromium.launch({ executablePath: await sp.executablePath(), args: sp.args, headless: true });
const page = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errors = []; page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
const res = []; const ok = (n, v, extra = "") => res.push(`${v ? "PASS" : "FAIL"} ${n}${extra ? " (" + extra + ")" : ""}`);
const base = "http://localhost:3000";
await page.goto(base + "/admin/login", { waitUntil: "networkidle" });
await page.fill("#email", "admin@example.test"); await page.fill("#password", "demo-pass-1"); await page.click('button[type="submit"]');
await page.waitForURL("**/admin/dashboard");
// 1 confirm dialog: opens, Cancel closes, Escape closes
await page.goto(base + "/admin/news", { waitUntil: "networkidle" });
await page.locator('button:has-text("Delete")').first().click();
ok("confirm dialog opens", await page.getByRole("alertdialog").isVisible());
ok("Cancel is focused", await page.evaluate(() => document.activeElement?.textContent === "Cancel"));
await page.keyboard.press("Escape"); await page.waitForTimeout(300);
ok("Escape closes dialog", !(await page.getByRole("alertdialog").count()));
// 2 table semantics
ok("table has column headers", (await page.locator("table th[scope=col]").count()) >= 4, `${await page.locator("table th[scope=col]").count()} headers`);
// 3 EN/FR tabs + error summary jump
await page.goto(base + "/admin/news/new", { waitUntil: "networkidle" });
const tabs = await page.getByRole("tab").count(); ok("EN/FR tabs rendered", tabs >= 2, `${tabs} tabs`);
await page.getByRole("tab", { name: "Français" }).first().click();
ok("FR tab shows French field", await page.locator('[id$="-fr"]').first().isVisible());
await page.getByRole("button", { name: "Publish" }).click();
const summary = page.getByRole("alert").filter({ hasText: "Please fix" }); ok("error summary shown on empty publish", await summary.isVisible());
await summary.locator("a", { hasText: /^Title/ }).first().click(); await page.waitForTimeout(300);
ok("summary link switches back to the EN field", await page.evaluate(() => { const a = document.activeElement; return !!a && /-en$/.test(a.id) && a.offsetParent !== null; }), await page.evaluate(() => document.activeElement?.id));
// 4 toast on save
await page.goto(base + "/admin/news", { waitUntil: "networkidle" });
await page.locator('table a:has-text("Edit")').first().click(); await page.waitForURL(/\/admin\/news\/.+/);
await page.getByRole("button", { name: /Save changes|Publish/ }).first().click();
await page.waitForSelector("[data-sonner-toast]", { timeout: 5000 }).catch(() => {});
ok("success toast appears", (await page.locator("[data-sonner-toast]").count()) > 0, (await page.locator("[data-sonner-toast]").first().innerText().catch(() => "")).replace(/\n/g, " | "));
// 5 Radix select on users page
await page.goto(base + "/admin/users", { waitUntil: "networkidle" });
await page.locator('[role=combobox]').first().click();
ok("role select opens options", (await page.getByRole("option").count()) >= 3, `${await page.getByRole("option").count()} options`);
await page.keyboard.press("Escape");
ok("no page errors", errors.length === 0, errors.join("; "));
console.log(res.join("\n")); await b.close();
