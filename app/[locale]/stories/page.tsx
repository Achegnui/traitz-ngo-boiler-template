import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/blocks/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { AppLink } from "@/components/ui/AppLink";
import { Media } from "@/components/ui/Media";
import { routing } from "@/i18n/routing";
import { getStories } from "@/lib/data";
import { formatDate, localize } from "@/lib/i18n";
import { listCopy, listMetadata } from "@/lib/page-shell";
import { Container, Section } from "@/components/ui/Section";
import { leadClass, listReset, monoLabel, moreLink, moreLinkHover } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Console edits go live within this many seconds (ISR). In `next dev` pages are always fresh. */
export const revalidate = 60;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return hasLocale(routing.locales, locale) ? listMetadata(locale, "/stories") : {};
}

export default async function StoriesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [stories, copy, tr] = await Promise.all([getStories(), listCopy(locale, "/stories"), getTranslations({ locale, namespace: "common" })]);
  return (
    <>
      <PageHeader block={{ id: "ph", type: "pageHeader", heading: { en: copy.title }, intro: { en: copy.description } }} locale={locale} />
      <Section tight>
        <Container>
          {stories.length === 0 ? <p className={leadClass}>{tr("noStories")}</p> : (
            <ol className={cn(listReset, "grid gap-20 max-[860px]:gap-14")}>
              {stories.map((s, i) => (
                <li key={s.id}>
                  <Reveal>
                    <AppLink href={`/stories/${s.slug}`} className="group grid grid-cols-[1.1fr_1fr] items-center gap-14 max-[860px]:grid-cols-1 max-[860px]:gap-6">
                      <span className={cn("relative block", i % 2 && "order-2 max-[860px]:order-0")}><Media image={s.coverImage} locale={locale} sizes="(max-width: 860px) 100vw, 560px" className="m-0 rounded-[4px]" /></span>
                      <span className="flex flex-col items-start gap-3.5">
                        <time className={monoLabel} dateTime={s.publishedAt}>{formatDate(s.publishedAt, locale)}</time>
                        <span className="font-display text-[clamp(30px,3.6vw,52px)] leading-[1.02] font-extrabold tracking-[-0.03em] group-hover:underline group-hover:decoration-brand-accent group-hover:decoration-[3px] group-hover:underline-offset-[6px]">{localize(s.title, locale)}</span>
                        <span className="text-[18px] text-brand-muted">{localize(s.excerpt, locale)}</span>
                        <span className={cn(moreLink, moreLinkHover, "mt-[18px]")}>{tr("readOn")} <ArrowUpRight size={16} aria-hidden="true" /></span>
                      </span>
                    </AppLink>
                  </Reveal>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </Section>
    </>
  );
}
