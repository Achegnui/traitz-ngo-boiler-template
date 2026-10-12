import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { ProgressBar } from "@/components/motion/ProgressBar";
import { AppLink } from "@/components/ui/AppLink";
import { Media } from "@/components/ui/Media";
import { ProgrammeCard } from "@/components/ui/ProgrammeCard";
import { SectionHead } from "@/components/ui/SectionHead";
import { routing } from "@/i18n/routing";
import { getAllProgrammes, getProgrammeBySlug } from "@/lib/data";
import { xaf } from "@/lib/format";
import { localize } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { fundingPercent } from "@/lib/utils";
import { PageBanner } from "@/components/blocks/PageHeader";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/Section";
import { cardGrid, figCaption, figClass, figMedia, monoLabel, moreLink, proseP, proseWrap } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Console edits go live within this many seconds (ISR). In `next dev` pages are always fresh. */
export const revalidate = 30;
type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const all = await getAllProgrammes();
  return routing.locales.flatMap((locale) => all.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = hasLocale(routing.locales, locale) ? await getProgrammeBySlug(slug) : null;
  if (!p || !hasLocale(routing.locales, locale)) return {};
  return pageMetadata({ locale, path: `/programmes/${slug}`, title: localize(p.title, locale), description: localize(p.summary, locale) });
}

export default async function ProgrammePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [p, all, tr, trp] = await Promise.all([getProgrammeBySlug(slug), getAllProgrammes(), getTranslations({ locale, namespace: "common" }), getTranslations({ locale, namespace: "programme" })]);
  if (!p) notFound();
  const percent = fundingPercent(p);
  const paras = p.body ? localize(p.body, locale).split(/\n{2,}/).filter(Boolean) : [];
  const others = all.filter((x) => x.id !== p.id).slice(0, 3);
  return (
    <>
      <PageBanner
        kicker={<AppLink href="/programmes" className="inline-flex items-center gap-1.5 hover:underline"><ArrowLeft size={14} aria-hidden="true" /> {tr("backProgrammes")}</AppLink>}
        heading={localize(p.title, locale)}
        intro={localize(p.summary, locale)}
      />
      <Section tight>
        <Container className="grid grid-cols-[1.5fr_1fr] items-start gap-16 max-[860px]:grid-cols-1 max-[860px]:gap-10">
          <Reveal>
            <figure className={figClass}>
              <Media image={p.coverImage} locale={locale} sizes="(max-width: 860px) 100vw, 640px" priority className={figMedia} />
              {p.coverImage.caption && <figcaption className={figCaption}>{localize(p.coverImage.caption, locale)}</figcaption>}
            </figure>
          </Reveal>
          <Reveal i={1}>
            <aside className="rounded-2xl border border-brand-ink bg-white p-7 min-[861px]:sticky min-[861px]:top-24">
              {percent !== null ? (
                <>
                  <p className={monoLabel}>{trp("funded", { percent })}</p>
                  <p className="mt-2 mb-[18px] font-display text-[clamp(64px,8vw,104px)] leading-none font-extrabold tracking-[-0.04em]">{percent}<span className="ml-1 text-[.4em] text-brand-muted">%</span></p>
                  <ProgressBar percent={percent} label={trp("funded", { percent })} />
                  <dl className={cn(monoLabel, "mt-[22px] mb-[26px] flex justify-between gap-3")}>
                    <div><dt className="text-[11px] text-brand-muted">{tr("raised")}</dt><dd className="mt-1 text-[15px] text-brand-ink">{xaf(p.fundingRaised ?? 0, locale)}</dd></div>
                    <div><dt className="text-[11px] text-brand-muted">{tr("goal")}</dt><dd className="mt-1 text-[15px] text-brand-ink">{xaf(p.fundingGoal ?? 0, locale)}</dd></div>
                  </dl>
                </>
              ) : null}
              <Button asChild arrow><AppLink href={`/donate?programme=${p.id}`}>{tr("fundThis")}</AppLink></Button>
            </aside>
          </Reveal>
        </Container>
      </Section>
      {paras.length > 0 && (
        <Section tight>
          <Container className={proseWrap}><Reveal>{paras.map((t, i) => <p key={i} className={proseP(i)}>{t}</p>)}</Reveal></Container>
        </Section>
      )}
      {others.length > 0 && (
        <Section tone="alt">
          <Container>
            <Reveal><SectionHead heading={tr("backProgrammes")} /></Reveal>
            <div className={cardGrid}>
              {others.map((o, i) => (
                <Reveal key={o.id} i={i} className="h-full"><ProgrammeCard p={o} locale={locale} showProgress fundLabel={tr("fundThis")} fundedText={(pc) => trp("funded", { percent: pc })} /></Reveal>
              ))}
            </div>
            <p className="mt-7 text-right"><AppLink href="/programmes" className={moreLink}>{tr("viewAll")} <ArrowUpRight size={16} aria-hidden="true" /></AppLink></p>
          </Container>
        </Section>
      )}
    </>
  );
}
