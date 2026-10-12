import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { ProgrammeCard } from "@/components/ui/ProgrammeCard";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { cardGrid } from "@/components/ui/typography";
import { getProgrammes } from "@/lib/data";
import { localize } from "@/lib/i18n";
import type { ProgrammeGridBlock } from "@/lib/types";
import type { BlockProps } from "./types";

export async function ProgrammeGrid({ block, locale }: BlockProps<ProgrammeGridBlock>) {
  const [items, tr] = await Promise.all([getProgrammes(block.programmeRefs), getTranslations({ locale, namespace: "programme" })]);
  return (
    <Section>
      <Container>
        <Reveal><SectionHead heading={localize(block.heading, locale)} /></Reveal>
        <div className={cardGrid}>
          {items.map((p, i) => (
            <Reveal key={p.id} i={i} className="h-full">
              <ProgrammeCard p={p} locale={locale} showProgress={block.showProgress} fundLabel={localize(block.fundLabel, locale)} fundedText={(percent) => tr("funded", { percent })} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
