import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import { DONATE_FORM_KEYS, THANKS_KEYS } from "@/lib/donate-client";

type Ns = Record<string, string>;
const bundles = { en: en as unknown as Record<string, Ns>, fr: fr as unknown as Record<string, Ns> };
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe.each([["donate", DONATE_FORM_KEYS], ["thanks", THANKS_KEYS]] as const)("%s strings", (ns, keys) => {
  it("has every key the components use, in English and French", () => {
    for (const l of ["en", "fr"] as const) for (const k of keys) expect(bundles[l][ns][k], `${l}.${ns}.${k}`).toBeTruthy();
  });
  it("has the same keys in both languages", () => {
    expect(Object.keys(bundles.fr[ns]).sort()).toEqual(Object.keys(bundles.en[ns]).sort());
  });
  it("has no untranslated French, no em dashes and matching {placeholders}", () => {
    for (const k of Object.keys(bundles.en[ns])) {
      const e = bundles.en[ns][k];
      const f = bundles.fr[ns][k];
      expect(f, `fr.${ns}.${k} is identical to English`).not.toBe(e);
      expect(e + f, `${ns}.${k} has an em dash`).not.toMatch(/\u2014/);
      expect(placeholders(f), `${ns}.${k} placeholders`).toEqual(placeholders(e));
    }
  });
});

describe("thanks namespace", () => {
  it("carries the page title strings the thank-you route reads directly", () => {
    for (const k of ["metaTitle", "metaDescription", "title", "intro"]) {
      expect(bundles.en.thanks[k]).toBeTruthy();
      expect(bundles.fr.thanks[k]).toBeTruthy();
    }
  });
  it("the obsolete 'being connected' notice is gone from the donate strings", () => {
    expect("soon" in bundles.en.donate).toBe(false);
    expect("soon" in bundles.fr.donate).toBe(false);
  });
});
