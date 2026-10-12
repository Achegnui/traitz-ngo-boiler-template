import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const config: NextConfig = {
  // Always defined, so Next inlines it as a constant and the unused admin backend (the in-memory test one by
  // default) is removed from the bundle instead of shipping.
  env: {
    NEXT_PUBLIC_ADMIN_BACKEND: process.env.NEXT_PUBLIC_ADMIN_BACKEND ?? "firebase",
    NEXT_PUBLIC_ADMIN_CACHE: process.env.NEXT_PUBLIC_ADMIN_CACHE ?? "on",
    NEXT_PUBLIC_FAKE_LATENCY_MS: process.env.NEXT_PUBLIC_FAKE_LATENCY_MS ?? "0",
  },
  images: {
    // Cloudinary serves uploaded images; the Firebase Storage hosts are kept in case Storage is enabled later.
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default withNextIntl(config);
