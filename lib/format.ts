import type { Locale } from "@/i18n/routing";

/** 21600000 -> "21.6M XAF" (compact, locale aware). */
export const xaf = (n: number, locale: Locale) =>
  `${new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n)} XAF`;

/** "2026-11-14T09:00" is a wall-clock time with no timezone: read it as written, never shift it by the server's zone. */
export function wallTime(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso);
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0))) : new Date(NaN);
}
export const fmtTime = (iso: string, locale: Locale) =>
  iso.includes("T") ? new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(wallTime(iso)) : "";
export const fmtLong = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(wallTime(iso));
export const mb = (bytes?: number) => (!bytes ? "" : bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`);
