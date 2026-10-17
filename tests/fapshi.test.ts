import { describe, expect, it, vi } from "vitest";
import { createFapshiClient, FapshiConfigError, FapshiError, readFapshiConfig, type FapshiConfig } from "@/lib/server/fapshi";

const sandbox: FapshiConfig = { apiUser: "user-1", apiKey: "FAK_TEST_secret", env: "sandbox", baseUrl: "https://sandbox.fapshi.com" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const clientWith = (fetchImpl: ReturnType<typeof vi.fn>) => createFapshiClient(sandbox, fetchImpl as unknown as typeof fetch);

describe("readFapshiConfig", () => {
  it("maps sandbox to the sandbox host and defaults to sandbox", () => {
    const c = readFapshiConfig({ FAPSHI_API_USER: "u", FAPSHI_API_KEY: "FAK_TEST_abc", FAPSHI_ENV: "sandbox" });
    expect(c).toEqual({ apiUser: "u", apiKey: "FAK_TEST_abc", env: "sandbox", baseUrl: "https://sandbox.fapshi.com" });
    expect(readFapshiConfig({ FAPSHI_API_USER: "u", FAPSHI_API_KEY: "FAK_TEST_abc" }).env).toBe("sandbox");
  });
  it("maps live to the live host", () => {
    expect(readFapshiConfig({ FAPSHI_API_USER: "u", FAPSHI_API_KEY: "FAK_real", FAPSHI_ENV: "live" }).baseUrl).toBe("https://live.fapshi.com");
  });
  it("rejects missing keys, a bad mode and a key that disagrees with the mode", () => {
    expect(() => readFapshiConfig({})).toThrow(FapshiConfigError);
    expect(() => readFapshiConfig({ FAPSHI_API_USER: "u" })).toThrow(/FAPSHI_API_KEY/);
    expect(() => readFapshiConfig({ FAPSHI_API_USER: "u", FAPSHI_API_KEY: "FAK_TEST_a", FAPSHI_ENV: "staging" })).toThrow(/sandbox/);
    expect(() => readFapshiConfig({ FAPSHI_API_USER: "u", FAPSHI_API_KEY: "FAK_real", FAPSHI_ENV: "sandbox" })).toThrow(/FAK_TEST_/);
    expect(() => readFapshiConfig({ FAPSHI_API_USER: "u", FAPSHI_API_KEY: "FAK_TEST_a", FAPSHI_ENV: "live" })).toThrow(/cannot use a sandbox key/);
  });
});

describe("initiatePay", () => {
  it("POSTs to /initiate-pay with the auth headers and returns link and transId", async () => {
    const f = vi.fn(async () => reply({ message: "Success", link: "https://sandbox.fapshi.com/pay/X", transId: "TX999999" }));
    const out = await clientWith(f).initiatePay({ amount: 5000, email: "a@b.test", externalId: "don1", redirectUrl: "http://localhost:3001/en/donate/thank-you?d=don1", message: "Donation" });
    expect(out).toEqual({ link: "https://sandbox.fapshi.com/pay/X", transId: "TX999999" });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://sandbox.fapshi.com/initiate-pay");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ apiuser: "user-1", apikey: "FAK_TEST_secret", "Content-Type": "application/json" });
    expect(JSON.parse(init.body as string)).toMatchObject({ amount: 5000, email: "a@b.test", externalId: "don1", message: "Donation" });
  });
  it("rejects an amount Fapshi would refuse without calling the network", async () => {
    const f = vi.fn();
    await expect(clientWith(f).initiatePay({ amount: 99 })).rejects.toMatchObject({ statusCode: 400 });
    await expect(clientWith(f).initiatePay({ amount: 150.5 })).rejects.toBeInstanceOf(FapshiError);
    expect(f).not.toHaveBeenCalled();
  });
  it("turns an HTTP error into a FapshiError with Fapshi's message and never leaks the keys", async () => {
    const f = vi.fn(async () => reply({ message: "Invalid credentials" }, 401));
    const err = await clientWith(f).initiatePay({ amount: 1000 }).catch((e) => e);
    expect(err).toBeInstanceOf(FapshiError);
    expect(err).toMatchObject({ statusCode: 401, message: "Invalid credentials" });
    expect(String(err.message)).not.toContain("FAK_TEST_secret");
  });
  it("rejects a success body without a usable link or transId", async () => {
    await expect(clientWith(vi.fn(async () => reply({ message: "ok" }))).initiatePay({ amount: 1000 })).rejects.toMatchObject({ statusCode: 502 });
    await expect(clientWith(vi.fn(async () => reply({ link: "https://x.test", transId: "../x" }))).initiatePay({ amount: 1000 })).rejects.toMatchObject({ statusCode: 502 });
  });
  it("maps a network failure to 502 and a timeout to 504", async () => {
    await expect(clientWith(vi.fn(async () => { throw new TypeError("fetch failed"); })).initiatePay({ amount: 1000 })).rejects.toMatchObject({ statusCode: 502 });
    await expect(clientWith(vi.fn(async () => { throw new DOMException("timed out", "TimeoutError"); })).initiatePay({ amount: 1000 })).rejects.toMatchObject({ statusCode: 504 });
  });
});

describe("getPaymentStatus", () => {
  it("GETs /payment-status/{id}, upper-cases the status and reads amount and externalId", async () => {
    const f = vi.fn(async () => reply({ transId: "TX123456", status: "successful", amount: 10000, externalId: "don1" }));
    const out = await clientWith(f).getPaymentStatus("TX123456");
    expect(out).toEqual({ transId: "TX123456", status: "SUCCESSFUL", amount: 10000, externalId: "don1" });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://sandbox.fapshi.com/payment-status/TX123456");
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
  });
  it("accepts a numeric string amount and tolerates a missing amount or externalId", async () => {
    expect((await clientWith(vi.fn(async () => reply({ transId: "TX123456", status: "PENDING", amount: "2500" }))).getPaymentStatus("TX123456")).amount).toBe(2500);
    expect(await clientWith(vi.fn(async () => reply({ transId: "TX123456", status: "CREATED" }))).getPaymentStatus("TX123456")).toMatchObject({ amount: null, externalId: null });
  });
  it("refuses an id that could change the URL, without calling the network", async () => {
    const f = vi.fn();
    for (const bad of ["", "ab", "../admin", "TX1/../../x", "TX123456?x=1", "a".repeat(65)]) {
      await expect(clientWith(f).getPaymentStatus(bad)).rejects.toMatchObject({ statusCode: 400 });
    }
    expect(f).not.toHaveBeenCalled();
  });
  it("surfaces a 404 and a malformed body", async () => {
    await expect(clientWith(vi.fn(async () => reply({ message: "Transaction not found" }, 404))).getPaymentStatus("TX123456")).rejects.toMatchObject({ statusCode: 404, message: "Transaction not found" });
    await expect(clientWith(vi.fn(async () => reply({ nope: true }))).getPaymentStatus("TX123456")).rejects.toMatchObject({ statusCode: 502 });
  });
});
