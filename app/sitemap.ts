import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllProgrammes, getNews, getStories, listPages } from "@/lib/data";
import { languageAlternates, pathFor, siteUrl } from "@/lib/seo";

export const revalidate = 300;

/** Only real pages (home, pages built in the admin, news posts). Coming-soon placeholders are noindex and left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, pages, programmes, stories] = await Promise.all([getNews(), listPages(), getAllProgrammes(), getStories()]);
  const entries: { path: string; lastModified?: string }[] = [
    { path: "/" },
    ...["/programmes", "/stories", "/news", "/donate"].map((path) => ({ path })),
    ...programmes.map((p) => ({ path: `/programmes/${p.slug}`, lastModified: p.updatedAt })),
    ...stories.map((x) => ({ path: `/stories/${x.slug}`, lastModified: x.updatedAt ?? x.publishedAt })),
    ...pages.filter((p) => p.slug !== "home").map((p) => ({ path: `/${p.slug}`, lastModified: p.updatedAt })),
    ...news.map((n) => ({ path: `/news/${n.slug}`, lastModified: n.updatedAt ?? n.publishedAt })),
  ];
  const abs = (p: string) => `${siteUrl}${p}`;
  return entries.flatMap(({ path, lastModified }) =>
    routing.locales.map((l) => ({
      url: abs(pathFor(l, path)),
      lastModified,
      alternates: { languages: Object.fromEntries(Object.entries(languageAlternates(path)).map(([k, v]) => [k, abs(v)])) },
    })),
  );
}
