import { Reveal } from "@/components/motion/Reveal";
import { AppLink } from "@/components/ui/AppLink";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/Section";
import { btnRow, headingXl, leadClass } from "@/components/ui/typography";
import { localize } from "@/lib/i18n";
import type { DonateCalloutBlock } from "@/lib/types";
import type { BlockProps } from "./types";

export function DonateCallout({ block, locale }: BlockProps<DonateCalloutBlock>) {
  return (
    <Section tone="alt">
      <Container>
        <Reveal>
          <h2 className={headingXl}>{localize(block.heading, locale)}</h2>
          <p className={leadClass}>{localize(block.body, locale)}</p>
          <div className={btnRow}>
            <Button asChild arrow><AppLink href={block.cta.href}>{localize(block.cta.label, locale)}</AppLink></Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
