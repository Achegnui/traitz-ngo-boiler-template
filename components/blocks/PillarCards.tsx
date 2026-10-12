import { Reveal } from "@/components/motion/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { ruleTop, stampClass } from "@/components/ui/typography";
import { Icon } from "@/lib/icons";
import { localize } from "@/lib/i18n";
import type { PillarCardsBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

/** Four ruled columns. Column borders and padding are re-drawn at 2 columns (980px) and 1 column (560px). */
const led = "border-r border-border px-7 pt-8 pb-3 first:pl-0 last:border-r-0 last:pr-0 max-[980px]:nth-2:border-r-0 max-[980px]:nth-2:pr-0 max-[980px]:nth-3:pl-0 max-[980px]:nth-[n+3]:border-t max-[560px]:border-r-0 max-[560px]:px-0 max-[560px]:py-7 max-[560px]:not-first:border-t";

export function PillarCards({ block, locale }: BlockProps<PillarCardsBlock>) {
  return (
    <Section>
      <Container>
        {block.heading && <Reveal><SectionHead heading={localize(block.heading, locale)} /></Reveal>}
        <div className={cn("mt-14 grid grid-cols-4 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1", ruleTop)}>
          {block.cards.map((c, i) => (
            <Reveal key={c.title.en} i={i} className={led}>
              <article>
                <span className={stampClass}><Icon name={c.icon} /></span>
                <h3 className="mt-7 mb-2.5 text-[26px]">{localize(c.title, locale)}</h3>
                <p className="text-[16px] text-brand-muted">{localize(c.body, locale)}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
