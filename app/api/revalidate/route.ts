import { revalidatePath } from "next/cache";
import { verifyStaff } from "@/lib/server/staff";

export const dynamic = "force-dynamic";

/** Called by the admin after a save so the public site updates immediately instead of within 30 seconds. */
export async function POST(req: Request) {
  if (!(await verifyStaff(req))) return Response.json({ error: "Please sign in again." }, { status: 401 });
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
