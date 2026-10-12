import { ArrowUpRight } from "lucide-react";
import { ProgressBar } from "@/components/motion/ProgressBar";
import { AppLink } from "@/components/ui/AppLink";
import { Card } from "@/components/ui/card";
import { Media } from "@/components/ui/Media";
import { monoLabel, moreLink, moreLinkHover } from "@/components/ui/typography";
import type { Locale } from "@/i18n/routing";
import { xaf } from "@/lib/format";
import { localize } from "@/lib/i18n";
import type { Programme } from "@/lib/types";
import { cn, fundingPercent } from "@/lib/utils";

export function ProgrammeCard({ p, locale, showProgress, fundLabel, fundedText, as: Title = "h3" }: {
  as?: "h2" | "h3"; p: Programme; locale: Locale; showProgress: boolean; fundLabel: string; fundedText: (percent: number) => string;
}) {
  const percent = showProgress ? fundingPercent(p) : null;
  const href = `/programmes/${p.slug}`;
  // The card title styles apply to h3 only (an h2 title keeps the body size), exactly as before the conversion.
  const h3 = Title === "h3";
  return (
    <article className="group/pc h-full">
      <Card className="block h-full gap-0 border-border rounded-2xl p-5 shadow-none [transition:border-color_.2s_ease-out] hover:border-brand-ink">
        <AppLink href={href} className="mb-[18px] block overflow-hidden rounded-[10px]" aria-hidden="true" tabIndex={-1}><Media image={p.coverImage} locale={locale} className="m-0 rounded-none" /></AppLink>
        <Title className={cn(h3 && "mt-1 mb-2 text-[26px] tracking-[-0.02em]")}>
          <AppLink href={href} className={cn(h3 && "hover:underline hover:decoration-brand-accent hover:decoration-[3px] hover:underline-offset-[5px]")}>{localize(p.title, locale)}</AppLink>
        </Title>
        <p className="text-[15.5px] text-brand-muted">{localize(p.summary, locale)}</p>
        {percent !== null && (
          <div className="mt-[18px]">
            <ProgressBar percent={percent} label={fundedText(percent)} />
            <div className={cn(monoLabel, "mt-4 flex justify-between text-[11px] text-brand-muted")}><span>{fundedText(percent)}</span><span>{xaf(p.fundingRaised ?? 0, locale)} / {xaf(p.fundingGoal ?? 0, locale)}</span></div>
          </div>
        )}
        <AppLink className={cn(moreLink, moreLinkHover, "mt-[18px]")} href={`/donate?programme=${p.id}`}>{fundLabel} <ArrowUpRight size={16} aria-hidden="true" /></AppLink>
      </Card>
    </article>
  );
}
