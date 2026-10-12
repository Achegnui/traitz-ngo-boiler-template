import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { listReset } from "@/components/ui/typography";
import { getPartners } from "@/lib/data";
import { localize } from "@/lib/i18n";
import type { PartnerWallBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

export async function PartnerWall({ block, locale }: BlockProps<PartnerWallBlock>) {
  const partners = await getPartners();
  return (
    <Section tone="alt" tight>
      <Container>
        {block.heading && <Reveal><SectionHead kicker={localize(block.heading, locale)} /></Reveal>}
        <ul className={cn(listReset, "mt-7 grid grid-cols-5 border-t-2 border-l border-t-brand-ink border-l-border max-[860px]:grid-cols-2")}>
          {partners.map((p) => {
            const mark = p.logoUrl ? <Image src={p.logoUrl} alt={p.name} width={140} height={40} /> : <span className="font-display text-[20px] font-extrabold leading-[normal] tracking-[-0.02em] text-brand-ink">{p.name}</span>;
            return <li key={p.id} className="grid place-items-center border-r border-b border-border px-5 py-9 text-center">{p.websiteUrl ? <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer">{mark}</a> : mark}</li>;
          })}
        </ul>
      </Container>
    </Section>
  );
}
