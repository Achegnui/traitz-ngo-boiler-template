import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getNewsBySlug } from "@/lib/data";
import { localize } from "@/lib/i18n";
import { ogImage, ogSize } from "@/lib/og";

export const revalidate = 60;

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Preview card";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const item = await getNewsBySlug(slug);
  return ogImage({ kicker: item ? localize(item.category, locale) : "News", title: item ? localize(item.title, locale) : "" });
}
