import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { siteName } from "@/theme/brand.config";

/** Set NEXT_PUBLIC_SITE_URL in production. Falls back to Vercel's production host, then localhost. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

/** "/" -> "/en", "/news/x" -> "/en/news/x" */
export const pathFor = (locale: Locale, path: string) => `/${locale}${path === "/" ? "" : path}`;
export const absoluteUrl = (locale: Locale, path: string) => `${siteUrl}${pathFor(locale, path)}`;

const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR" };

export function languageAlternates(path: string) {
  return {
    ...Object.fromEntries(routing.locales.map((l) => [l, pathFor(l, path)])),
    "x-default": pathFor(routing.defaultLocale, path),
  };
}

type Input = {
  locale: Locale;
  path: string;
  title: string | { absolute: string };
  description: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  /** Preview image. Defaults to the home page's generated image; routes with their own opengraph-image file override it. */
  image?: string;
};

/** Canonical, hreflang, Open Graph and Twitter tags. Preview images come from the opengraph-image routes. */
export function pageMetadata({ locale, path, title, description, type = "website", publishedTime, modifiedTime, noindex, image }: Input): Metadata {
  const plain = typeof title === "string" ? title : title.absolute;
  const img = image ?? `${pathFor(locale, "/")}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: pathFor(locale, path), languages: languageAlternates(path) },
    openGraph: {
      type, title: plain, description, url: pathFor(locale, path), siteName: siteName(),
      locale: OG_LOCALE[locale], alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: plain, description, images: [img] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
