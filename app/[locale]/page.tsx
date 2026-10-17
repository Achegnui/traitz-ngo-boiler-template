import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/BlockRenderer";
import { JsonLd } from "@/components/JsonLd";
import { routing } from "@/i18n/routing";
import { getPage, getSite } from "@/lib/data";
import { localize } from "@/lib/i18n";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { siteName } from "@/theme/brand.config";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const page = await getPage("home");
  if (!page) return {};
  return pageMetadata({
    locale, path: "/",
    title: { absolute: `${siteName()} | ${localize(page.seo.title, locale)}` },
    description: localize(page.seo.description, locale),
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [page, site] = await Promise.all([getPage("home"), getSite()]);
  if (!page) notFound();
  const org = site.organization;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NGO",
          name: siteName(),
          url: absoluteUrl(locale, "/"),
          description: localize(site.meta.description, locale),
          areaServed: org.areaServed,
          address: { "@type": "PostalAddress", addressLocality: org.addressLocality, addressCountry: org.addressCountry },
        }}
      />
      <BlockRenderer blocks={page.blocks} locale={locale} />
    </>
  );
}
