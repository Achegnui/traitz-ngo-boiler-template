import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Section";
import { localize } from "@/lib/i18n";
import type { StatStripBlock } from "@/lib/types";
import type { BlockProps } from "./types";

export function StatStrip({ block, locale }: BlockProps<StatStripBlock>) {
  return (
    <div className="grain contour-light relative overflow-hidden bg-brand-anchor py-20 text-white">
      <Container className="relative z-2 grid grid-cols-4 gap-0 max-[700px]:grid-cols-2 max-[700px]:gap-y-9">
        {block.stats.map((s, i) => (
          <Reveal key={s.label.en} i={i} className="border-l border-white/20 px-7 first:border-l-0 first:pl-0 max-[700px]:odd:border-l-0 max-[700px]:odd:pl-0">
            <div className="font-display text-[clamp(46px,5.6vw,80px)] font-extrabold leading-none tracking-[-0.04em] text-brand-accent"><CountUp value={s.value} locale={locale} prefix={s.prefix} suffix={s.suffix} /></div>
            <div className="mt-3 text-[14px] tracking-[.02em] text-white/72">{localize(s.label, locale)}</div>
          </Reveal>
        ))}
      </Container>
    </div>
  );
}
