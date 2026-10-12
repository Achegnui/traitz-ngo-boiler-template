import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getProgrammeBySlug } from "@/lib/data";
import { localize } from "@/lib/i18n";
import { ogImage, ogSize } from "@/lib/og";

export const revalidate = 30;

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Preview card";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const item = await getProgrammeBySlug(slug);
  return ogImage({ kicker: "Programme", title: item ? localize(item.title, locale) : "" });
}
