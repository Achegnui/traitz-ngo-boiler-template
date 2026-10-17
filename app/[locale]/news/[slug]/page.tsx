import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { AppLink } from "@/components/ui/AppLink";
import { Media } from "@/components/ui/Media";
import { routing } from "@/i18n/routing";
import { getNews, getNewsBySlug, servedFallback } from "@/lib/data";
import { formatDate, localize } from "@/lib/i18n";
import { absoluteUrl, pageMetadata, siteUrl } from "@/lib/seo";
import { siteName } from "@/theme/brand.config";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/Section";
import { btnRow, headingXl, monoLabel, proseP, proseWrap } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export const revalidate = 60;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const items = await getNews();
  if (servedFallback()) return [];
  return routing.locales.flatMap((locale) => items.map((n) => ({ locale, slug: n.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = hasLocale(routing.locales, locale) ? await getNewsBySlug(slug) : null;
  if (!item || !hasLocale(routing.locales, locale)) return {};
  return pageMetadata({
    locale, path: `/news/${slug}`, type: "article",
    title: localize(item.title, locale),
    description: localize(item.excerpt, locale),
    publishedTime: item.publishedAt, modifiedTime: item.updatedAt ?? item.publishedAt,
  });
}

export default async function NewsPost({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [item, tr] = await Promise.all([getNewsBySlug(slug), getTranslations({ locale, namespace: "common" })]);
  if (!item) notFound();
  const title = localize(item.title, locale);
  const paras = localize(item.body, locale).split(/\n{2,}/).filter(Boolean);
  return (
    <Section as="article">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description: localize(item.excerpt, locale),
          inLanguage: locale,
          datePublished: item.publishedAt,
          dateModified: item.updatedAt ?? item.publishedAt,
          articleSection: localize(item.category, locale),
          image: `${siteUrl}/${locale}/news/${slug}/opengraph-image`,
          mainEntityOfPage: absoluteUrl(locale, `/news/${slug}`),
          author: { "@type": "Organization", name: siteName() },
          publisher: { "@type": "Organization", name: siteName() },
        }}
      />
      <Container className={proseWrap}>
        <span className={cn(monoLabel, "text-brand-muted")}>{localize(item.category, locale)} · <time dateTime={item.publishedAt}>{formatDate(item.publishedAt, locale)}</time></span>
        <h1 className={cn(headingXl, "mt-3 mb-7")}>{title}</h1>
        <Media image={item.coverImage} locale={locale} sizes="(max-width: 760px) 100vw, 720px" />
        <div className="mt-7">{paras.map((p, i) => <p key={i} className={proseP(i)}>{p}</p>)}</div>
        <div className={cn(btnRow, "max-w-none!")}><Button asChild arrow><AppLink href="/">{tr("backHome")}</AppLink></Button></div>
      </Container>
    </Section>
  );
}
