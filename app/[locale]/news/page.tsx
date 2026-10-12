import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/blocks/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { NewsIndex } from "@/components/ui/NewsIndex";
import { routing } from "@/i18n/routing";
import { getNews } from "@/lib/data";
import { listCopy, listMetadata } from "@/lib/page-shell";
import { Container, Section } from "@/components/ui/Section";
import { leadClass } from "@/components/ui/typography";

/** Console edits go live within this many seconds (ISR). In `next dev` pages are always fresh. */
export const revalidate = 30;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return hasLocale(routing.locales, locale) ? listMetadata(locale, "/news") : {};
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [items, copy, tr] = await Promise.all([getNews(), listCopy(locale, "/news"), getTranslations({ locale, namespace: "common" })]);
  return (
    <>
      <PageHeader block={{ id: "ph", type: "pageHeader", heading: { en: copy.title }, intro: { en: copy.description } }} locale={locale} />
      <Section tight>
        <Container>{items.length === 0 ? <p className={leadClass}>{tr("noNews")}</p> : <Reveal><NewsIndex items={items} locale={locale} /></Reveal>}</Container>
      </Section>
    </>
  );
}
