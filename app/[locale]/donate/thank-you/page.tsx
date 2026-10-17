import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { DonationStatus } from "@/components/donate/DonationStatus";
import { Container, Section } from "@/components/ui/Section";
import { routing } from "@/i18n/routing";
import { THANKS_KEYS, type ThanksStrings } from "@/lib/donate-client";
import { pageMetadata } from "@/lib/seo";

/** Same refresh rhythm as the rest of the site. The page itself is static: the donation id is read in the browser, so it works from cache. */
export const revalidate = 60;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "thanks" });
  return pageMetadata({ locale, path: "/donate/thank-you", title: t("metaTitle"), description: t("metaDescription"), noindex: true });
}

export default async function ThankYouPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "thanks" });
  // Raw, because some messages hold {placeholders} that the browser fills in.
  const strings = Object.fromEntries(THANKS_KEYS.map((k) => [k, String(t.raw(k))])) as ThanksStrings;
  return (
    <>
      <PageHeader block={{ id: "ph", type: "pageHeader", heading: { en: t("title") }, intro: { en: t("intro") } }} locale={locale} />
      <Section tight>
        <Container className={"max-w-[760px]"}>
          <noscript><p className="border-l-[3px] border-brand-accent bg-brand-tint px-3.5 py-2.5 text-[14px]">{strings.noScript}</p></noscript>
          <Suspense fallback={null}>
            <DonationStatus t={strings} locale={locale} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
