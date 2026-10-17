import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { DonateForm } from "@/components/donate/DonateForm";
import { Reveal } from "@/components/motion/Reveal";
import { routing } from "@/i18n/routing";
import { getAllProgrammes } from "@/lib/data";
import { DONATE_FORM_KEYS, type DonateFormStrings } from "@/lib/donate-client";
import { localize } from "@/lib/i18n";
import { listCopy, listMetadata } from "@/lib/page-shell";
import { Container, Section } from "@/components/ui/Section";
import { headingXl, listReset, monoLabel, ruleTop } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Console edits go live within this many seconds (ISR). In `next dev` pages are always fresh. */
export const revalidate = 60;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return hasLocale(routing.locales, locale) ? listMetadata(locale, "/donate") : {};
}

export default async function DonatePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [programmes, copy, t] = await Promise.all([getAllProgrammes(), listCopy(locale, "/donate"), getTranslations({ locale, namespace: "donate" })]);
  const nf = new Intl.NumberFormat(locale);
  const tiers: [number, string][] = [[5000, t("tier5")], [10000, t("tier10")], [25000, t("tier25")], [50000, t("tier50")]];
  // Raw, because some messages hold {placeholders} that the form fills in.
  const strings = Object.fromEntries(DONATE_FORM_KEYS.map((k) => [k, String(t.raw(k))])) as DonateFormStrings;
  return (
    <>
      <PageHeader block={{ id: "ph", type: "pageHeader", heading: { en: copy.title }, intro: { en: copy.description } }} locale={locale} />
      <Section tight>
        <Container className="grid grid-cols-[1fr_1.1fr] items-start gap-[72px] max-[900px]:grid-cols-[minmax(0,1fr)] max-[900px]:gap-12">
          <Reveal>
            <h2 className={headingXl}>{t("impactTitle")}</h2>
            <ol className={cn(listReset, "mt-8", ruleTop)}>
              {tiers.map(([n, text]) => (
                <li key={n} className="grid grid-cols-[160px_1fr] items-baseline gap-5 border-b border-border py-[22px] max-[900px]:grid-cols-1 max-[900px]:gap-1">
                  <b className="font-display text-[30px] leading-[normal] font-extrabold tracking-[-0.03em]">{nf.format(n)} <span className={cn(monoLabel, "ml-1 text-[11px] text-brand-muted")}>XAF</span></b>
                  <span className="text-brand-muted">{text}</span>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal i={1}>
            <Suspense fallback={null}>
              <DonateForm t={strings} locale={locale} programmes={programmes.map((p) => ({ id: p.id, label: localize(p.title, locale) }))} />
            </Suspense>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
