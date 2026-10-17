import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fs = vi.hoisted(() => ({ getDoc: vi.fn(), getDocs: vi.fn() }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({})), doc: vi.fn(() => ({})), query: vi.fn((c: unknown) => c), where: vi.fn(),
  getDoc: fs.getDoc, getDocs: fs.getDocs,
}));
vi.mock("@/lib/firebase", () => ({ getDb: () => ({}) }));

const BUILD = "phase-production-build";
const SERVER = "phase-production-server";
async function load() {
  vi.resetModules(); // the build-time "fell back" flag is module state, so each test starts clean
  return import("@/lib/source");
}
const snapshot = (docs: { id: string; data: Record<string, unknown> }[], fromCache = false) => ({
  metadata: { fromCache }, docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
});
const offlineError = () => Object.assign(new Error("Failed to get document because the client is offline."), { code: "unavailable" });

beforeEach(() => {
  vi.stubEnv("DATA_SOURCE", "");
  fs.getDoc.mockReset();
  fs.getDocs.mockReset();
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe("online", () => {
  it("readPublished returns the documents with their ids, and an empty collection is a real empty list", async () => {
    vi.stubEnv("NEXT_PHASE", SERVER);
    const { readPublished } = await load();
    fs.getDocs.mockResolvedValueOnce(snapshot([{ id: "a", data: { status: "published", n: 1 } }]));
    expect(await readPublished("news")).toEqual([{ status: "published", n: 1, id: "a" }]);
    fs.getDocs.mockResolvedValueOnce(snapshot([]));
    expect(await readPublished("news")).toEqual([]);
  });
  it("readDoc returns the document, null when it does not exist, and null when the rules hide it", async () => {
    vi.stubEnv("NEXT_PHASE", SERVER);
    const { readDoc } = await load();
    fs.getDoc.mockResolvedValueOnce({ exists: () => true, id: "x", data: () => ({ t: 1 }) });
    expect(await readDoc("pages", "x")).toEqual({ t: 1, id: "x" });
    fs.getDoc.mockResolvedValueOnce({ exists: () => false });
    expect(await readDoc("pages", "gone")).toBeNull();
    fs.getDoc.mockRejectedValueOnce(Object.assign(new Error("denied"), { code: "permission-denied" }));
    expect(await readDoc("pages", "draft")).toBeNull();
  });
  it("DATA_SOURCE=local never touches Firestore", async () => {
    vi.stubEnv("DATA_SOURCE", "local");
    const { readPublished } = await load();
    expect((await readPublished("programmes")).length).toBeGreaterThan(0);
    expect(fs.getDocs).not.toHaveBeenCalled();
  });
});

describe("during the build, with Firestore unreachable", () => {
  beforeEach(() => vi.stubEnv("NEXT_PHASE", BUILD));

  it("falls back to the bundled content when a document read fails, warns once and marks the build as served-from-fallback", async () => {
    const { readDoc, servedFallback } = await load();
    fs.getDoc.mockRejectedValue(offlineError());
    expect(servedFallback()).toBe(false);
    const site = await readDoc("settings", "site");
    expect(site?.id).toBe("site");
    expect(servedFallback()).toBe(true);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(String((console.warn as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0])).toContain("client is offline");
  });
  it("treats a list answered from the empty local cache as a failed read, and returns the bundled list instead of a blank one", async () => {
    const { readPublished, servedFallback } = await load();
    fs.getDocs.mockResolvedValueOnce(snapshot([], true)); // what the SDK really does when offline
    const programmes = await readPublished<{ title: unknown }>("programmes");
    expect(programmes.map((p) => p.id)).toEqual(expect.arrayContaining(["wum-water", "girls-school"]));
    expect(servedFallback()).toBe(true);
  });
  it("after the first failure later reads skip the network instead of waiting on it again", async () => {
    const { readDoc, readPublished } = await load();
    fs.getDoc.mockRejectedValueOnce(offlineError());
    await readDoc("settings", "site");
    await readPublished("programmes");
    await readDoc("pages", "about");
    expect(fs.getDocs).not.toHaveBeenCalled();
    expect(fs.getDoc).toHaveBeenCalledTimes(1);
  });
  it("gives up after 8 seconds and falls back", async () => {
    vi.useFakeTimers();
    const { readPublished, servedFallback } = await load();
    fs.getDocs.mockReturnValue(new Promise(() => undefined)); // never answers
    const pending = readPublished("programmes");
    await vi.advanceTimersByTimeAsync(7999);
    expect(servedFallback()).toBe(false);
    await vi.advanceTimersByTimeAsync(2);
    expect((await pending).length).toBeGreaterThan(0);
    expect(servedFallback()).toBe(true);
    expect(String((console.warn as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0])).toContain("timed out after 8s");
  });
  it("does not treat a hidden (permission-denied) document as an outage", async () => {
    const { readDoc, servedFallback } = await load();
    fs.getDoc.mockRejectedValueOnce(Object.assign(new Error("denied"), { code: "permission-denied" }));
    expect(await readDoc("pages", "draft")).toBeNull();
    expect(servedFallback()).toBe(false);
  });
});

describe("at runtime, a failed read must never become a blank page", () => {
  beforeEach(() => vi.stubEnv("NEXT_PHASE", SERVER));

  it("rethrows a failed document read so Next keeps serving the last good version", async () => {
    const { readDoc, servedFallback } = await load();
    fs.getDoc.mockRejectedValueOnce(offlineError());
    await expect(readDoc("settings", "site")).rejects.toThrow(/offline/);
    expect(servedFallback()).toBe(false);
  });
  it("rethrows a list answered from the local cache instead of returning it empty", async () => {
    const { readPublished } = await load();
    fs.getDocs.mockResolvedValueOnce(snapshot([], true));
    await expect(readPublished("programmes")).rejects.toThrow(/answered from the local cache/);
  });
  it("rethrows a timeout after 8 seconds", async () => {
    vi.useFakeTimers();
    const { readPublished } = await load();
    fs.getDocs.mockReturnValue(new Promise(() => undefined));
    const pending = readPublished("news");
    const assertion = expect(pending).rejects.toThrow(/timed out after 8s/);
    await vi.advanceTimersByTimeAsync(8001);
    await assertion;
  });
  it("does not use the bundled content outside the build, even after a failure", async () => {
    const { readPublished } = await load();
    fs.getDocs.mockRejectedValueOnce(offlineError());
    await expect(readPublished("news")).rejects.toThrow();
    fs.getDocs.mockResolvedValueOnce(snapshot([{ id: "live", data: { status: "published" } }]));
    expect((await readPublished("news")).map((n) => n.id)).toEqual(["live"]);
  });
});
