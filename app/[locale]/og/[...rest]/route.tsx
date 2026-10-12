import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPage, getSite } from "@/lib/data";
import { localize } from "@/lib/i18n";
import { ogImage } from "@/lib/og";

export const revalidate = 30;

/**
 * Preview image for placeholder pages. Next cannot serve a file-based opengraph-image beneath a
 * catch-all segment, so the placeholder metadata points here instead: /en/og/about -> card for /about.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string; rest: string[] }> }) {
  const { locale: raw, rest } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const page = rest.length === 1 ? await getPage(rest[0]) : null;
  const meta = page?.seo ?? (await getSite()).routeMeta[`/${rest.join("/")}`];
  return ogImage({ kicker: "NGO · Cameroon", title: meta ? localize(meta.title, locale) : "" });
}
