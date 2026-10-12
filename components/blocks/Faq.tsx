import { Reveal } from "@/components/motion/Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { localize } from "@/lib/i18n";
import type { FaqBlock } from "@/lib/types";
import type { BlockProps } from "./types";

export function Faq({ block, locale }: BlockProps<FaqBlock>) {
  return (
    <Section>
      <Container>
        {block.heading && <Reveal><SectionHead heading={localize(block.heading, locale)} /></Reveal>}
        <Reveal>
          <Accordion type="multiple" className="mt-9 max-w-[820px] border-t-2 border-brand-ink">
            {block.items.map((it, i) => (
              <AccordionItem key={it.q.en} value={`q${i}`} className="border-border last:border-b">
                <AccordionTrigger
                  chevron={false}
                  className="relative cursor-pointer py-6 pr-11 font-display text-[22px] leading-[1.25] font-bold tracking-[-0.01em] hover:no-underline after:absolute after:top-1/2 after:right-1 after:-translate-y-1/2 after:font-mono after:text-[30px] after:leading-[normal] after:font-normal after:content-['+'] data-[state=open]:after:content-['−']"
                >
                  {localize(it.q, locale)}
                </AccordionTrigger>
                <AccordionContent forceMount className="max-w-[700px] pr-11 pb-[26px] text-[17px] leading-[1.6] text-brand-muted">{localize(it.a, locale)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </Section>
  );
}
