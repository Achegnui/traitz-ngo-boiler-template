import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/blocks/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ProgrammeCard } from "@/components/ui/ProgrammeCard";
import { routing } from "@/i18n/routing";
import { getAllProgrammes } from "@/lib/data";
import { listCopy, listMetadata } from "@/lib/page-shell";
import { Container, Section } from "@/components/ui/Section";
import { cardGrid, leadClass } from "@/components/ui/typography";

/** Console edits go live within this many seconds (ISR). In `next dev` pages are always fresh. */
export const revalidate = 30;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return hasLocale(routing.locales, locale) ? listMetadata(locale, "/programmes") : {};
}

export default async function ProgrammesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [items, copy, tr, trp] = await Promise.all([getAllProgrammes(), listCopy(locale, "/programmes"), getTranslations({ locale, namespace: "common" }), getTranslations({ locale, namespace: "programme" })]);
  return (
    <>
      <PageHeader block={{ id: "ph", type: "pageHeader", heading: { en: copy.title }, intro: { en: copy.description } }} locale={locale} />
      <Section tight>
        <Container>
          {items.length === 0 ? <p className={leadClass}>{tr("noProgrammes")}</p> : (
            <div className={cardGrid}>
              {items.map((p, i) => (
                <Reveal key={p.id} i={i % 3} className="h-full">
                  <ProgrammeCard as="h2" p={p} locale={locale} showProgress fundLabel={tr("fundThis")} fundedText={(percent) => trp("funded", { percent })} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
