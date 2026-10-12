import { Reveal } from "@/components/motion/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { leadClass, listReset, monoLabel, stampClass } from "@/components/ui/typography";
import { Icon } from "@/lib/icons";
import { localize } from "@/lib/i18n";
import type { ContactInfoBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

const value = "m-0 font-display text-[clamp(20px,2vw,26px)] leading-[1.2] font-bold tracking-[-0.02em]";

export function ContactInfo({ block, locale }: BlockProps<ContactInfoBlock>) {
  return (
    <Section>
      <Container>
        {block.heading && <Reveal><SectionHead heading={localize(block.heading, locale)} /></Reveal>}
        {block.intro && <Reveal><p className={leadClass}>{localize(block.intro, locale)}</p></Reveal>}
        <ul className={cn(listReset, "mt-11 grid grid-cols-2 gap-x-14 gap-y-11 max-[700px]:grid-cols-1")}>
          {block.items.map((it, i) => (
            <li key={it.label.en}>
              <Reveal i={i % 3} className="grid grid-cols-[58px_1fr] items-center gap-x-5">
                <span className={cn(stampClass, "row-span-2 row-start-1")}><Icon name={it.icon} /></span>
                <p className={cn(monoLabel, "m-0 self-end text-[11px] text-brand-muted")}>{localize(it.label, locale)}</p>
                {it.href ? <a href={it.href} className={cn(value, "self-start justify-self-start border-b-2 border-brand-accent")}>{localize(it.value, locale)}</a> : <p className={value}>{localize(it.value, locale)}</p>}
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
