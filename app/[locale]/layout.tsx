import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";
import { getSite } from "@/lib/data";
import { localize } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";
import { siteName, themeVars } from "@/theme/brand.config";
import "../globals.css";

const bricolage = localFont({ src: "../fonts/bricolage-grotesque-latin-wght-normal.woff2", variable: "--font-bricolage", display: "swap", weight: "200 800" });
// Fraunces is the optional alternative display font (brand.config fonts.display). preload:false keeps it off the
// critical path unless selected; if you switch to it, set preload: true here. (next/font needs literal options.)
const fraunces = localFont({ src: "../fonts/fraunces-latin-wght-normal.woff2", variable: "--font-fraunces", display: "swap", preload: false, weight: "100 900" });
const inter = localFont({ src: "../fonts/inter-latin-wght-normal.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });
// Mono is only ever used at weight 500 (labels, badges), so fetch just that instance.
const mono = localFont({ src: "../fonts/jetbrains-mono-latin-500-normal.woff2", variable: "--font-mono-brand", display: "swap", weight: "500" });

/** Console edits go live within this many seconds (ISR). In `next dev` pages are always fresh. */
export const revalidate = 60;

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const site = await getSite();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: siteName(), template: `%s | ${siteName()}` },
    description: localize(site.meta.description, l),
    applicationName: siteName(),
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const site = await getSite();
  return (
    <html lang={locale} className={`${bricolage.variable} ${fraunces.variable} ${inter.variable} ${mono.variable}`} style={themeVars()} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <NextIntlClientProvider>
          <Header site={site} locale={locale} />
          <main className="[counter-reset:sec]">{children}</main>
          <Footer site={site} locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
