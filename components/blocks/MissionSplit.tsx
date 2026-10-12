import { Reveal } from "@/components/motion/Reveal";
import { AppLink } from "@/components/ui/AppLink";
import { Button } from "@/components/ui/button";
import { Media } from "@/components/ui/Media";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { btnRow, figCaption, figClass, figMedia, headingXl, leadClass } from "@/components/ui/typography";
import { localize } from "@/lib/i18n";
import type { MissionSplitBlock } from "@/lib/types";
import type { BlockProps } from "./types";

export function MissionSplit({ block, locale }: BlockProps<MissionSplitBlock>) {
  const { ctaPrimary, ctaSecondary, image } = block;
  const caption = image.caption ? localize(image.caption, locale) : "";
  return (
    <Section tone="alt">
      <Container className="grid grid-cols-2 items-center gap-16 max-[860px]:grid-cols-1 max-[860px]:gap-8">
        <Reveal>
          <figure className={figClass}>
            <Media image={image} locale={locale} sizes="(max-width: 860px) 100vw, 560px" className={figMedia} />
            {caption && <figcaption className={figCaption}>{caption}</figcaption>}
          </figure>
        </Reveal>
        <Reveal i={1}>
          <SectionHead kicker={block.kicker ? localize(block.kicker, locale) : undefined} />
          <h2 className={headingXl}>{localize(block.heading, locale)}</h2>
          <p className={leadClass}>{localize(block.body, locale)}</p>
          <div className={btnRow}>
            <Button asChild arrow><AppLink href={ctaPrimary.href}>{localize(ctaPrimary.label, locale)}</AppLink></Button>
            {ctaSecondary && <Button asChild variant="outline"><AppLink href={ctaSecondary.href}>{localize(ctaSecondary.label, locale)}</AppLink></Button>}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
