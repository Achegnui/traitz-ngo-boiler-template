import { describe, expect, it } from "vitest";
import { AdminConfigError, readAdminCredentials } from "@/lib/server/firebase-admin";

const key = "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n";
const base = { NEXT_PUBLIC_FIREBASE_PROJECT_ID: "traitz-ngo-demo", FIREBASE_ADMIN_CLIENT_EMAIL: "svc@traitz-ngo-demo.iam.gserviceaccount.com" };

describe("readAdminCredentials", () => {
  it("returns the three fields", () => {
    expect(readAdminCredentials({ ...base, FIREBASE_ADMIN_PRIVATE_KEY: key })).toEqual({
      projectId: "traitz-ngo-demo", clientEmail: "svc@traitz-ngo-demo.iam.gserviceaccount.com", privateKey: key.trim(),
    });
  });
  it("turns literal backslash-n sequences back into line breaks", () => {
    const c = readAdminCredentials({ ...base, FIREBASE_ADMIN_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n" });
    expect(c.privateKey).toBe(key.trim());
  });
  it("names every missing variable", () => {
    expect(() => readAdminCredentials({})).toThrow(AdminConfigError);
    expect(() => readAdminCredentials({})).toThrow(/NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY/);
    expect(() => readAdminCredentials({ ...base })).toThrow(/missing FIREBASE_ADMIN_PRIVATE_KEY/);
  });
  it("rejects a value that is not a PEM private key and does not echo it", () => {
    const attempt = () => readAdminCredentials({ ...base, FIREBASE_ADMIN_PRIVATE_KEY: "hunter2-not-a-key" });
    expect(attempt).toThrow(/PEM/);
    expect(attempt).not.toThrow(/hunter2/);
  });
});
