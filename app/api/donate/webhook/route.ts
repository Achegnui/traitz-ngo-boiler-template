import { donationDeps } from "@/lib/server/donate-deps";
import { settleByTransactionId } from "@/lib/server/donations";
import { clientIp, failureResponse, json, readJsonBody } from "@/lib/server/http";
import { allow } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TRANS_ID = /^[A-Za-z0-9_-]{4,64}$/;

/**
 * Fapshi calls this when a payment changes. The body is NOT trusted: only its transId is used, and the real status
 * is fetched from Fapshi with our keys before anything is saved. An unknown transaction answers 200 so it is not retried.
 */
export async function POST(req: Request) {
  if (!allow(`webhook:${clientIp(req)}`, 120, 60_000)) return json({ error: "rate_limited" }, 429);

  const raw = await readJsonBody(req, 16_384);
  if (!raw.ok) return json({ error: raw.error }, raw.status);
  const transId = typeof raw.body === "object" && raw.body !== null ? (raw.body as { transId?: unknown }).transId : undefined;
  if (typeof transId !== "string" || !TRANS_ID.test(transId)) return json({ error: "invalid_payload" }, 400);

  try {
    const { outcome } = await settleByTransactionId(donationDeps(), transId);
    if (outcome === "unknown" || outcome === "mismatch") console.warn(`[donate] webhook for ${transId}: ${outcome}, nothing updated`);
    return json({ ok: true });
  } catch (e) {
    return failureResponse(e);
  }
}
