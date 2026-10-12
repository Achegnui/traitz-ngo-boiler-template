import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { leadClass, listReset, monoLabel, ruleTop } from "@/components/ui/typography";
import { getEvents } from "@/lib/data";
import { fmtTime, wallTime } from "@/lib/format";
import { localize } from "@/lib/i18n";
import type { EventListBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

export async function EventList({ block, locale }: BlockProps<EventListBlock>) {
  const [events, tr] = await Promise.all([getEvents(), getTranslations({ locale, namespace: "common" })]);
  const Item = block.heading ? "h3" : "h2";
  const now = new Date().toISOString().slice(0, 16);
  const sorted = [...events].sort((a, b) => {
    const au = a.startsAt >= now, bu = b.startsAt >= now;
    return au === bu ? (au ? a.startsAt.localeCompare(b.startsAt) : b.startsAt.localeCompare(a.startsAt)) : au ? -1 : 1; // upcoming first, soonest first
  });
  return (
    <Section>
      <Container>
        {block.heading && <Reveal><SectionHead heading={localize(block.heading, locale)} /></Reveal>}
        {sorted.length === 0 ? <p className={leadClass}>{localize(block.emptyText, locale)}</p> : (
          <ol className={cn(listReset, "mt-10", ruleTop)}>
            {sorted.map((e, i) => {
              const d = wallTime(e.startsAt), upcoming = e.startsAt >= now;
              const month = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(d);
              const times = [fmtTime(e.startsAt, locale), e.endsAt ? fmtTime(e.endsAt, locale) : ""].filter(Boolean).join(" – ");
              // Item styles apply to an h3 only (an h2 keeps the body size), exactly as before the conversion.
              const itemCls = block.heading ? cn("text-[26px]", !upcoming && "opacity-60") : undefined;
              return (
                <li key={e.id}>
                  <Reveal i={i % 3} className="grid grid-cols-[130px_1fr_auto] items-start gap-7 border-b border-border py-[30px] max-[700px]:grid-cols-[84px_1fr]">
                    <time className="flex flex-col" dateTime={e.startsAt}>
                      <b className={cn("font-display text-[60px] leading-none font-extrabold tracking-[-0.04em] max-[700px]:text-[44px]", !upcoming && "opacity-60")}>{d.getUTCDate()}</b>
                      <span className={cn(monoLabel, "mt-2 text-[11px] text-brand-muted")}>{month} {d.getUTCFullYear()}</span>
                    </time>
                    <div>
                      <Item className={itemCls}>{localize(e.title, locale)}</Item>
                      <p className="mt-1.5 max-w-[620px] text-brand-muted">{localize(e.description, locale)}</p>
                      <p className={cn(monoLabel, "mt-3 max-w-[620px] text-[11px] text-brand-ink")}>{[times, localize(e.location, locale)].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className={cn(monoLabel, "rounded-full border px-3 py-1.5 text-[11px] whitespace-nowrap max-[700px]:col-start-2 max-[700px]:justify-self-start", upcoming ? "border-brand-accent bg-brand-accent text-brand-anchor" : "border-border text-brand-muted")}>{upcoming ? tr("upcoming") : tr("past")}</span>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        )}
      </Container>
    </Section>
  );
}
