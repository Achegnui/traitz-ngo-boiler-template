import { donationDeps } from "@/lib/server/donate-deps";
import { getDonationStatus } from "@/lib/server/donations";
import { clientIp, failureResponse, json } from "@/lib/server/http";
import { allow } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ID = /^[A-Za-z0-9]{10,40}$/;

/** GET /api/donate/status?id=... for the thank-you page: { status, amount, currency, frequency }, no personal data. */
export async function GET(req: Request) {
  if (!allow(`status:${clientIp(req)}`, 300, 10 * 60_000)) return json({ error: "rate_limited" }, 429);
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!ID.test(id)) return json({ error: "not_found" }, 404);
  try {
    const donation = await getDonationStatus(donationDeps(), id);
    return donation ? json(donation) : json({ error: "not_found" }, 404);
  } catch (e) {
    return failureResponse(e);
  }
}
