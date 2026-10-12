import { withCache } from "./cache";
import type { AdminBackend } from "./types";

/**
 * NEXT_PUBLIC_ADMIN_BACKEND=fake swaps in an in-memory backend for offline UI testing. It is a build-time
 * constant (see next.config.ts), so the fake is not shipped in a normal build.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const raw: AdminBackend =
  process.env.NEXT_PUBLIC_ADMIN_BACKEND === "fake"
    ? require("./backend.fake").fakeBackend
    : require("./backend.firebase").firebaseBackend;

export const backend: AdminBackend = process.env.NEXT_PUBLIC_ADMIN_CACHE === "off" ? raw : withCache(raw);
