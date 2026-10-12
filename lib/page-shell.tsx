import type { Locale } from "@/i18n/routing";
import { getSite } from "@/lib/data";
import { localize } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

/** Title and intro for a list page come from settings/site > routeMeta, so staff can edit them. */
export async function listCopy(locale: Locale, path: string) {
  const meta = (await getSite()).routeMeta[path];
  return { title: meta ? localize(meta.title, locale) : path.slice(1), description: meta ? localize(meta.description, locale) : "" };
}
export async function listMetadata(locale: Locale, path: string) {
  const c = await listCopy(locale, path);
  return pageMetadata({ locale, path, title: c.title, description: c.description });
}
