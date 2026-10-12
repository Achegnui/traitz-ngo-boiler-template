import { Reveal } from "@/components/motion/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { proseP, proseWrap } from "@/components/ui/typography";
import { localize } from "@/lib/i18n";
import type { RichTextBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

/** Blank line = new paragraph. A real rich-text format can replace this when the admin editor lands. */
export function RichText({ block, locale }: BlockProps<RichTextBlock>) {
  const paras = localize(block.content, locale).split(/\n{2,}/);
  return (
    <Section>
      <Container className={cn(proseWrap)}>
        <Reveal>{paras.map((p, i) => <p key={i} className={proseP(i)}>{p}</p>)}</Reveal>
      </Container>
    </Section>
  );
}
