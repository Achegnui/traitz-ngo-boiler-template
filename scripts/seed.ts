/**
 * Seeds Firestore with the demo content from scripts/seed-data (spec section 13).
 *
 *   npm run seed                      write everything (refuses if pages/home already exists)
 *   npm run seed -- --missing         add only documents that do not exist yet; never overwrites your edits
 *   npm run seed -- --only pages/home,settings/site,programmes
 *                                     overwrite just these (a collection name, or collection/id)
 *   npm run seed -- --force           overwrite everything with the seed versions
 *   npm run seed -- --dry-run         validate and list what would be written, no network
 *
 * Once firestore.rules are published, writing needs an administrator. Provide one for this run:
 *   PowerShell:  $env:SEED_EMAIL="you@example.org"; $env:SEED_PASSWORD="your password"; npm run seed -- --missing
 * All documents go in one atomic batch.
 */
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { blockSchema, eventSchema, newsSchema, pageShell, partnerSchema, programmeSchema, reportSchema, siteSchema, storySchema, teamSchema } from "@/lib/schemas";
import { seedDocs } from "./seed-data";

const args = new Set(process.argv.slice(2));
const timeout = <T>(p: Promise<T>, ms: number, msg: string) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]);

function hasNestedArray(v: unknown): boolean {
  if (Array.isArray(v)) return v.some((x) => Array.isArray(x) || hasNestedArray(x));
  if (v && typeof v === "object") return Object.values(v).some(hasNestedArray);
  return false;
}

type Issues = { issues: { path: PropertyKey[]; message: string }[] };
type Safe = { safeParse: (v: unknown) => { success: boolean; error?: Issues } };
const schemaFor: Record<string, Safe> = {
  programmes: programmeSchema, stories: storySchema, news: newsSchema, team: teamSchema, partners: partnerSchema, settings: siteSchema, events: eventSchema, reports: reportSchema,
};

/** Check every document against the same schemas the website and admin use. */
function schemaProblems(): string[] {
  const out: string[] = [];
  const fmt = (key: string, e?: Issues) =>
    out.push(`${key}: ${e?.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  for (const d of seedDocs) {
    const key = `${d.collection}/${d.id}`;
    if (d.collection === "pages") {
      const { blocks, ...rest } = d.data as { blocks: unknown[] };
      const shell = pageShell.safeParse(rest);
      if (!shell.success) fmt(key, shell.error);
      blocks.forEach((b, i) => { const r = blockSchema.safeParse(b); if (!r.success) fmt(`${key} block ${i}`, r.error); });
    } else {
      const r = schemaFor[d.collection]?.safeParse(d.data);
      if (r && !r.success) fmt(key, r.error);
    }
  }
  return out;
}

function validate(): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const d of seedDocs) {
    const key = `${d.collection}/${d.id}`;
    if (seen.has(key)) problems.push(`${key}: duplicate document`);
    seen.add(key);
    if (hasNestedArray(d.data)) problems.push(`${key}: contains an array inside an array (Firestore rejects this)`);
    if (Buffer.byteLength(JSON.stringify(d.data)) > 900_000) problems.push(`${key}: larger than 900 KB (Firestore limit is 1 MiB)`);
    if (d.collection !== "settings" && d.data.status !== "published") problems.push(`${key}: status is not "published"`);
  }
  return [...problems, ...schemaProblems()];
}

async function main() {
  const counts: Record<string, number> = {};
  for (const d of seedDocs) counts[d.collection] = (counts[d.collection] ?? 0) + 1;
  console.log("Seed contents:", counts, `(${seedDocs.length} documents)`);

  const problems = validate();
  if (problems.length) { console.error("Validation failed:\n - " + problems.join("\n - ")); process.exit(1); }
  console.log("Validation passed: no nested arrays, no oversized documents, all published, every document matches its schema.");
  if (args.has("--dry-run")) { console.log("Dry run: nothing written."); return; }

  const db = getDb();
  console.log(`Target project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
  const unreachable = "Could not reach Firestore within 30 s. Check your internet connection, the project id in .env.local, and that Firestore is enabled in the Firebase console.";

  // Once the real rules are published, only an administrator may write.
  if (process.env.SEED_EMAIL && process.env.SEED_PASSWORD) {
    await timeout(signInWithEmailAndPassword(getFirebaseAuth(), process.env.SEED_EMAIL, process.env.SEED_PASSWORD), 30_000, unreachable);
    console.log(`Signed in as ${process.env.SEED_EMAIL}`);
  } else {
    console.log("Not signed in. That only works while your rules allow open writes. Otherwise set SEED_EMAIL and SEED_PASSWORD (see the top of scripts/seed.ts).");
  }

  const exists = async (collection: string, id: string) => {
    try { return (await timeout(getDoc(doc(db, collection, id)), 30_000, unreachable)).exists(); }
    catch (e) { if ((e as { code?: string }).code === "permission-denied") return true; throw e; } // hidden draft: leave it alone
  };

  let todo = seedDocs;
  const onlyAt = process.argv.indexOf("--only");
  if (onlyAt > -1) {
    const wanted = (process.argv[onlyAt + 1] ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    if (!wanted.length) { console.error("--only needs a list, for example: --only pages/home,programmes"); process.exit(1); }
    todo = seedDocs.filter((d) => wanted.some((w) => w === d.collection || w === `${d.collection}/${d.id}`));
    console.log(`--only: overwriting ${todo.length} document(s): ${todo.map((d) => `${d.collection}/${d.id}`).join(", ")}`);
  } else if (args.has("--missing")) {
    const missing: typeof seedDocs = [];
    for (const d of seedDocs) if (!(await exists(d.collection, d.id))) missing.push(d);
    todo = missing;
    console.log(`--missing: ${todo.length} of ${seedDocs.length} documents are not in Firestore yet${todo.length ? `: ${todo.map((d) => `${d.collection}/${d.id}`).join(", ")}` : ""}`);
  } else if (!args.has("--force")) {
    if (await exists("pages", "home")) {
      console.error("pages/home already exists. Seeding again would overwrite edits made in the console.\nUse --missing to add only what is new, --only to refresh chosen documents, or --force to overwrite everything.");
      process.exit(2);
    }
  }
  if (!todo.length) { console.log("Nothing to write."); return; }

  const batch = writeBatch(db); // 500-operation limit; we are well under it
  for (const d of todo) batch.set(doc(db, d.collection, d.id), d.data);
  await timeout(batch.commit(), 30_000, unreachable);
  console.log(`Wrote ${todo.length} document(s). Next: npm run check:firebase`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
