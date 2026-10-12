import { Reveal } from "@/components/motion/Reveal";
import { Media } from "@/components/ui/Media";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { leadClass, listReset, monoLabel } from "@/components/ui/typography";
import { getTeam } from "@/lib/data";
import { localize } from "@/lib/i18n";
import type { TeamGridBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

export async function TeamGrid({ block, locale }: BlockProps<TeamGridBlock>) {
  const team = await getTeam();
  const Item = block.heading ? "h3" : "h2";
  return (
    <Section tone="alt">
      <Container>
        {block.heading && <Reveal><SectionHead heading={localize(block.heading, locale)} /></Reveal>}
        {block.intro && <Reveal><p className={leadClass}>{localize(block.intro, locale)}</p></Reveal>}
        <ul className={cn(listReset, "mt-12 grid grid-cols-3 gap-x-9 gap-y-14 max-[860px]:grid-cols-2 max-[860px]:gap-x-5 max-[860px]:gap-y-10 max-[480px]:grid-cols-1")}>
          {team.map((m, i) => (
            <li key={m.id}>
              <Reveal i={i % 3}>
                <Media image={m.photo} locale={locale} sizes="(max-width: 700px) 50vw, 280px" className="mb-[18px] aspect-[4/5] rounded-[4px]" />
                <Item className={block.heading ? "text-[26px]" : undefined}>{m.name}</Item>
                <p className={cn(monoLabel, "mt-1.5 mb-3 text-[11px] text-brand-muted")}>{localize(m.role, locale)}</p>
                <p className="text-[15.5px] text-brand-muted">{localize(m.bio, locale)}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
