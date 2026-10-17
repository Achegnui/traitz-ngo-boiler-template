import { donationDeps } from "@/lib/server/donate-deps";
import { donationInput, startDonation } from "@/lib/server/donations";
import { clientIp, failureResponse, json, readJsonBody, sameOrigin } from "@/lib/server/http";
import { allow } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LIMIT = 30; // per IP, per window
const WINDOW_MS = 10 * 60_000;

/** Validates the donation, saves it as pending and returns the Fapshi payment link: { donationId, link }. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (!allow(`initiate:${clientIp(req)}`, LIMIT, WINDOW_MS)) return json({ error: "rate_limited" }, 429);

  const raw = await readJsonBody(req, 4096);
  if (!raw.ok) return json({ error: raw.error }, raw.status);
  const parsed = donationInput.safeParse(raw.body);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0] ?? "")).filter(Boolean))];
    return json({ error: "invalid_input", fields }, 400);
  }
  try {
    return json(await startDonation(donationDeps(), parsed.data));
  } catch (e) {
    return failureResponse(e);
  }
}
