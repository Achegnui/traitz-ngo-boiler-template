export type FapshiEnv = "sandbox" | "live";

export const FAPSHI_BASE_URL: Record<FapshiEnv, string> = {
  sandbox: "https://sandbox.fapshi.com",
  live: "https://live.fapshi.com",
};
/** Fapshi rejects payments below 100 XAF. */
export const FAPSHI_MIN_AMOUNT = 100;
const TIMEOUT_MS = 15_000;
const TRANS_ID = /^[A-Za-z0-9_-]{4,64}$/;

/** Raised when the Fapshi keys are missing or do not match FAPSHI_ENV. Routes turn it into a 503. */
export class FapshiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FapshiConfigError";
  }
}

/** A failed call to Fapshi. statusCode is Fapshi's HTTP status, 502 for network errors, 504 for timeouts. */
export class FapshiError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = "FapshiError";
  }
}

export type FapshiConfig = { apiUser: string; apiKey: string; env: FapshiEnv; baseUrl: string };

/**
 * FAPSHI_ENV defaults to sandbox so a missing value can never charge real money. A sandbox key starts with
 * FAK_TEST_; the key and FAPSHI_ENV must agree, otherwise the call would fail at Fapshi with a confusing error.
 */
export function readFapshiConfig(env: Record<string, string | undefined> = process.env): FapshiConfig {
  const apiUser = env.FAPSHI_API_USER?.trim();
  const apiKey = env.FAPSHI_API_KEY?.trim();
  const mode = (env.FAPSHI_ENV?.trim() || "sandbox").toLowerCase();
  if (!apiUser || !apiKey) {
    throw new FapshiConfigError("Fapshi is not set up: FAPSHI_API_USER and FAPSHI_API_KEY are missing. See .env.example.");
  }
  if (mode !== "sandbox" && mode !== "live") {
    throw new FapshiConfigError(`FAPSHI_ENV must be "sandbox" or "live", got "${mode}".`);
  }
  const isTestKey = apiKey.startsWith("FAK_TEST_");
  if (mode === "sandbox" && !isTestKey) throw new FapshiConfigError("FAPSHI_ENV=sandbox needs a sandbox key (it starts with FAK_TEST_).");
  if (mode === "live" && isTestKey) throw new FapshiConfigError("FAPSHI_ENV=live cannot use a sandbox key (FAK_TEST_).");
  return { apiUser, apiKey, env: mode, baseUrl: FAPSHI_BASE_URL[mode] };
}

export type InitiatePayInput = {
  amount: number;
  email?: string;
  userId?: string;
  externalId?: string;
  redirectUrl?: string;
  message?: string;
};
export type InitiatePayResult = { link: string; transId: string };
/** status is Fapshi's value upper-cased: CREATED, PENDING, SUCCESSFUL, FAILED or EXPIRED. */
export type PaymentStatus = { transId: string; status: string; amount: number | null; externalId: string | null };

export interface FapshiClient {
  initiatePay(input: InitiatePayInput): Promise<InitiatePayResult>;
  getPaymentStatus(transId: string): Promise<PaymentStatus>;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function messageOf(body: unknown): string | null {
  return isRecord(body) && typeof body.message === "string" && body.message ? body.message.slice(0, 200) : null;
}

/** A small typed client over fetch (injectable for tests). Keys are only ever sent as headers and never put in an error. */
export function createFapshiClient(config: FapshiConfig, fetchImpl: typeof fetch = fetch): FapshiClient {
  async function call(path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<unknown> {
    let res: Response;
    try {
      res = await fetchImpl(`${config.baseUrl}${path}`, {
        method: init.method,
        headers: { "Content-Type": "application/json", apiuser: config.apiUser, apikey: config.apiKey },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });
    } catch (e) {
      const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
      throw new FapshiError(timedOut ? "Fapshi did not answer in time." : "Could not reach Fapshi.", timedOut ? 504 : 502);
    }
    const body: unknown = await res.json().catch(() => null);
    if (!res.ok) throw new FapshiError(messageOf(body) ?? `Fapshi answered with status ${res.status}.`, res.status);
    return body;
  }

  return {
    async initiatePay(input) {
      if (!Number.isInteger(input.amount) || input.amount < FAPSHI_MIN_AMOUNT) {
        throw new FapshiError(`Amount must be a whole number of at least ${FAPSHI_MIN_AMOUNT} XAF.`, 400);
      }
      const body = await call("/initiate-pay", { method: "POST", body: input });
      if (!isRecord(body) || typeof body.link !== "string" || typeof body.transId !== "string" || !TRANS_ID.test(body.transId)) {
        throw new FapshiError("Unexpected response from Fapshi.", 502);
      }
      return { link: body.link, transId: body.transId };
    },

    async getPaymentStatus(transId) {
      // The id can come from a webhook body, so it is checked before it goes into a URL.
      if (!TRANS_ID.test(transId)) throw new FapshiError("Invalid transaction id.", 400);
      const body = await call(`/payment-status/${encodeURIComponent(transId)}`, { method: "GET" });
      if (!isRecord(body) || typeof body.transId !== "string" || typeof body.status !== "string") {
        throw new FapshiError("Unexpected response from Fapshi.", 502);
      }
      const raw = body.amount;
      const amount =
        typeof raw === "number" && Number.isFinite(raw) ? raw
        : typeof raw === "string" && raw.trim() !== "" && Number.isFinite(Number(raw)) ? Number(raw)
        : null;
      return {
        transId: body.transId,
        status: body.status.toUpperCase(),
        amount,
        externalId: typeof body.externalId === "string" && body.externalId ? body.externalId : null,
      };
    },
  };
}
