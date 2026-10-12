import { cn } from "@/lib/utils";
import { headingXl, monoLabel } from "@/components/ui/typography";

/** Numbered section label (01, 02, ...) drawn by a CSS counter (reset on <main>), so every page numbers itself with no extra data. */
export function SectionHead({ kicker, heading, level = 2 }: { kicker?: string; heading?: string; level?: 1 | 2 }) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <>
      <div className="mb-5 flex items-center gap-3.5 text-brand-ink [counter-increment:sec]">
        <span className={cn(monoLabel, "text-brand-muted before:content-[counter(sec,decimal-leading-zero)]")} aria-hidden="true" />
        <span className="h-[3px] flex-[0_0_56px] bg-brand-accent" aria-hidden="true" />
        {kicker && <span className={cn(monoLabel, "text-brand-muted")}>{kicker}</span>}
      </div>
      {heading && <H className={headingXl}>{heading}</H>}
    </>
  );
}
