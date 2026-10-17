import { siteUrl } from "@/lib/seo";
import { firestoreDonationStore } from "@/lib/server/donation-store";
import type { DonationDeps } from "@/lib/server/donations";
import { createFapshiClient, readFapshiConfig } from "@/lib/server/fapshi";
import { getAdminDb } from "@/lib/server/firebase-admin";

/** Wires the real Firestore store and Fapshi client. Called per request, so missing keys fail the request, not the build. */
export function donationDeps(): DonationDeps {
  return { store: firestoreDonationStore(getAdminDb()), fapshi: createFapshiClient(readFapshiConfig()), siteUrl };
}
