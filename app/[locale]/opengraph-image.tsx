import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getPage } from "@/lib/data";
import { localize } from "@/lib/i18n";
import { ogImage, ogSize } from "@/lib/og";

export const revalidate = 30;

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Preview card";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const page = await getPage("home");
  return ogImage({ kicker: "NGO · Cameroon", title: page ? localize(page.seo.title, locale) : "" });
}
