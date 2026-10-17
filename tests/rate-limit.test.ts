import { beforeEach, describe, expect, it } from "vitest";
import { allow, resetRateLimits } from "@/lib/server/rate-limit";

beforeEach(resetRateLimits);

describe("allow", () => {
  it("lets `limit` calls through, then blocks until the window ends", () => {
    for (let i = 0; i < 3; i++) expect(allow("k", 3, 1000, 0)).toBe(true);
    expect(allow("k", 3, 1000, 500)).toBe(false);
    expect(allow("k", 3, 1000, 1000)).toBe(true);
  });
  it("counts each key separately", () => {
    expect(allow("a", 1, 1000, 0)).toBe(true);
    expect(allow("a", 1, 1000, 1)).toBe(false);
    expect(allow("b", 1, 1000, 1)).toBe(true);
  });
});
