import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { AppLink } from "@/components/ui/AppLink";
import { Media } from "@/components/ui/Media";
import { routing } from "@/i18n/routing";
import { getStories, getStoryBySlug } from "@/lib/data";
import { formatDate, localize } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageBanner } from "@/components/blocks/PageHeader";
import { Container, Section } from "@/components/ui/Section";
import { figCaption, figClass, figMedia, proseP, proseWrap } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Console edits go live within this many seconds (ISR). In `next dev` pages are always fresh. */
export const revalidate = 30;
type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const all = await getStories();
  return routing.locales.flatMap((locale) => all.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = hasLocale(routing.locales, locale) ? await getStoryBySlug(slug) : null;
  if (!s || !hasLocale(routing.locales, locale)) return {};
  return pageMetadata({ locale, path: `/stories/${slug}`, type: "article", title: localize(s.title, locale), description: localize(s.excerpt, locale), publishedTime: s.publishedAt });
}

export default async function StoryPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [s, tr] = await Promise.all([getStoryBySlug(slug), getTranslations({ locale, namespace: "common" })]);
  if (!s) notFound();
  const paras = s.body ? localize(s.body, locale).split(/\n{2,}/).filter(Boolean) : [];
  return (
    <article>
      <PageBanner
        kicker={<><AppLink href="/stories" className="inline-flex items-center gap-1.5 hover:underline"><ArrowLeft size={14} aria-hidden="true" /> {tr("backStories")}</AppLink> · <time dateTime={s.publishedAt}>{formatDate(s.publishedAt, locale)}</time></>}
        heading={localize(s.title, locale)}
        intro={localize(s.excerpt, locale)}
      />
      <Section tight>
        <Container className={proseWrap}>
          <Reveal>
            <figure className={cn(figClass, "mb-9")}>
              <Media image={s.coverImage} locale={locale} sizes="(max-width: 760px) 100vw, 720px" priority className={figMedia} />
              {s.coverImage.caption && <figcaption className={figCaption}>{localize(s.coverImage.caption, locale)}</figcaption>}
            </figure>
          </Reveal>
          <Reveal>{paras.map((t, i) => <p key={i} className={proseP(i)}>{t}</p>)}</Reveal>
        </Container>
      </Section>
    </article>
  );
}
