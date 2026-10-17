import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/BlockRenderer";
import { AppLink } from "@/components/ui/AppLink";
import { routing } from "@/i18n/routing";
import { getPage, getSite } from "@/lib/data";
import { localize } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/Section";
import { btnRow, headingXl, leadClass, monoLabel } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Console edits go live within this many seconds (ISR). In `next dev` pages are always fresh. */
export const revalidate = 60;

type Props = { params: Promise<{ locale: string; rest: string[] }> };

/** Pages built in the admin (pages/{slug}) live at /{locale}/{slug}. Anything else is the coming-soon placeholder. */
const builtPage = (rest: string[]) => (rest.length === 1 ? getPage(rest[0]) : Promise.resolve(null));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, rest } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const path = `/${rest.join("/")}`;
  const page = await builtPage(rest);
  if (page) {
    return pageMetadata({
      locale, path, title: localize(page.seo.title, locale), description: localize(page.seo.description, locale), image: `/${locale}/og${path}`,
    });
  }
  const [site, tr] = await Promise.all([getSite(), getTranslations({ locale, namespace: "common" })]);
  const meta = site.routeMeta[path];
  return pageMetadata({
    locale, path,
    title: meta ? localize(meta.title, locale) : tr("comingSoonTitle"),
    description: meta ? localize(meta.description, locale) : tr("comingSoonBody"),
    image: `/${locale}/og${path}`,
    noindex: true, // placeholder: leave out of search until the real page exists
  });
}

export default async function BuiltOrComingSoon({ params }: Props) {
  const { locale, rest } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const page = await builtPage(rest);
  if (page) {
    // Every page needs exactly one h1. A hero or page-header block provides it; without one, the page name does.
    const hasHero = page.blocks.some((b) => b.type === "hero" || b.type === "pageHeader");
    return (
      <>
        {!hasHero && (
          <Section tight>
            <Container><h1 className={headingXl}>{localize(page.title, locale)}</h1></Container>
          </Section>
        )}
        <BlockRenderer blocks={page.blocks} locale={locale} />
      </>
    );
  }
  const tr = await getTranslations({ locale, namespace: "common" });
  return (
    <Section className="min-h-[60svh]">
      <Container>
        <span className={cn(monoLabel, "text-brand-muted")}>{tr("comingSoonKicker")}</span>
        <h1 className={cn(headingXl, "mt-3")}>{tr("comingSoonTitle")}</h1>
        <p className={leadClass}>{tr("comingSoonBody")}</p>
        <div className={btnRow}><Button asChild arrow><AppLink href="/">{tr("backHome")}</AppLink></Button></div>
      </Container>
    </Section>
  );
}
