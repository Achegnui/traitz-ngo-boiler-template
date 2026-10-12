import { ArrowUpRight } from "lucide-react";
import { AppLink } from "@/components/ui/AppLink";
import { Media } from "@/components/ui/Media";
import { listReset, monoLabel, ruleTop } from "@/components/ui/typography";
import type { Locale } from "@/i18n/routing";
import { formatDate, localize } from "@/lib/i18n";
import type { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/** News as an index, like the contents page of a newspaper: date, picture, headline, category. */
export function NewsIndex({ items, locale }: { items: NewsItem[]; locale: Locale }) {
  return (
    <ol className={cn(listReset, "mt-11", ruleTop)}>
      {items.map((n) => (
        <li key={n.id}>
          <AppLink
            href={`/news/${n.slug}`}
            className="group grid grid-cols-[150px_112px_1fr_28px] items-center gap-6 border-b border-border py-5 [transition:padding_.25s_ease] hover:pl-3.5 max-[700px]:grid-cols-[84px_1fr] max-[700px]:gap-x-3.5 max-[700px]:gap-y-1.5"
          >
            <time className={cn(monoLabel, "text-[11px] text-brand-muted max-[700px]:col-start-2 max-[700px]:row-start-1")} dateTime={n.publishedAt}>{formatDate(n.publishedAt, locale)}</time>
            <span className="block w-[112px] max-[700px]:col-start-1 max-[700px]:row-[1/span_2] max-[700px]:w-[84px]"><Media image={n.coverImage} locale={locale} sizes="120px" className="m-0 rounded-[6px]" /></span>
            <span className="font-display text-[clamp(20px,2.2vw,28px)] leading-[1.15] font-bold tracking-[-0.02em] group-hover:underline group-hover:decoration-brand-accent group-hover:decoration-[3px] group-hover:underline-offset-[5px] max-[700px]:col-start-2 max-[700px]:row-start-2">
              {localize(n.title, locale)}
              <small className={cn(monoLabel, "mt-2 block text-[11px] text-brand-muted")}>{localize(n.category, locale)}</small>
            </span>
            <ArrowUpRight className="[transition:transform_.2s] group-hover:[transform:translate(3px,-3px)] max-[700px]:hidden" size={22} aria-hidden="true" />
          </AppLink>
        </li>
      ))}
    </ol>
  );
}
