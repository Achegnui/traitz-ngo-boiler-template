import { DonationError } from "@/lib/server/donations";
import { FapshiConfigError, FapshiError } from "@/lib/server/fapshi";
import { AdminConfigError } from "@/lib/server/firebase-admin";

export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Browsers send Origin on cross-site POSTs. A request without one (curl, server to server) is let through. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readJsonBody(req: Request, maxChars: number): Promise<{ ok: true; body: unknown } | { ok: false; status: 400 | 413; error: string }> {
  const text = await req.text();
  if (text.length > maxChars) return { ok: false, status: 413, error: "too_large" };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}

/** One mapping for all three routes. Codes are stable strings the donate page translates; details go to the server log only. */
export function failureResponse(e: unknown): Response {
  if (e instanceof FapshiConfigError || e instanceof AdminConfigError) {
    console.error(`[donate] ${e.message}`);
    return json({ error: "payments_not_configured" }, 503);
  }
  if (e instanceof DonationError) return json({ error: e.code }, 502);
  if (e instanceof FapshiError) {
    console.error(`[donate] Fapshi error ${e.statusCode}: ${e.message}`);
    return json({ error: "payment_unavailable" }, 502);
  }
  console.error("[donate] unexpected error", e);
  return json({ error: "server_error" }, 500);
}
