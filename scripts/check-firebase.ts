/** `npm run check:firebase`: confirms the app can read the seeded data exactly as the website does. */
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

const timeout = <T>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timed out after " + ms / 1000 + " s (offline, wrong project id, or Firestore not enabled)")), ms))]);

async function main() {
  const db = getDb();
  console.log("Project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const home = await timeout(getDoc(doc(db, "pages", "home")), 20_000);
  if (!home.exists()) { console.error("pages/home does not exist. Run: npm run seed"); process.exit(2); }
  const d = home.data() as { status: string; blocks: { type: string; headline?: { en?: string } }[] };
  console.log(`pages/home: status=${d.status}, ${d.blocks.length} blocks: ${d.blocks.map((b) => b.type).join(", ")}`);
  console.log(`hero headline (en): ${JSON.stringify(d.blocks.find((b) => b.type === "hero")?.headline?.en)}`);
  console.log("settings/site exists:", (await getDoc(doc(db, "settings", "site"))).exists());
  for (const c of ["programmes", "stories", "news", "team", "partners"]) {
    const snap = await timeout(getDocs(query(collection(db, c), where("status", "==", "published"))), 20_000);
    console.log(`${c.padEnd(11)} ${snap.size} published`);
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error("FAILED:", (e as { code?: string }).code ?? "", e instanceof Error ? e.message : e); process.exit(1); });
