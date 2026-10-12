import { Reveal } from "@/components/motion/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { listReset, ruleTop } from "@/components/ui/typography";
import { localize } from "@/lib/i18n";
import type { TimelineBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

export function Timeline({ block, locale }: BlockProps<TimelineBlock>) {
  return (
    <Section>
      <Container>
        {block.heading && <Reveal><SectionHead heading={localize(block.heading, locale)} /></Reveal>}
        <ol className={cn(listReset, "mt-12", ruleTop)}>
          {block.items.map((it, i) => (
            <li key={it.year + it.title.en} className="border-b border-border">
              <Reveal i={i % 3} className="grid grid-cols-[220px_1fr] gap-8 py-[30px] max-[700px]:grid-cols-1 max-[700px]:gap-2">
                <span className="font-display text-[clamp(40px,5vw,72px)] leading-none font-extrabold tracking-[-0.04em] after:ml-3 after:inline-block after:size-3 after:rounded-full after:bg-brand-accent after:align-middle after:content-['']">{it.year}</span>
                <div><h3 className="mt-1 mb-2 text-[26px]">{localize(it.title, locale)}</h3><p className="max-w-[640px] text-brand-muted">{localize(it.body, locale)}</p></div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
