import type { Locale } from "@/i18n/routing";

/** Every localisable field is { en, fr }. French falls back to English when empty (spec section 9). */
export type Localized = { en: string; fr?: string };

export const L = (en: string, fr?: string): Localized => ({ en, fr });

export function localize(v: Localized | undefined, locale: Locale): string {
  if (!v) return "";
  const s = v[locale];
  return s && s.trim() ? s : v.en;
}

/** Dates are stored as ISO strings (Firestore Timestamps in Phase 2) and formatted per locale. */
export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}
