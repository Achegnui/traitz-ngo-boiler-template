import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { localize } from "@/lib/i18n";
import type { TestimonialsBlock } from "@/lib/types";
import { cn, initials } from "@/lib/utils";
import type { BlockProps } from "./types";

type Item = TestimonialsBlock["items"][number];

const avatar = "size-11 flex-none rounded-full border border-border bg-white object-cover";

function Who({ q, locale, className }: { q: Item; locale: BlockProps<TestimonialsBlock>["locale"]; className: string }) {
  return (
    <figcaption className={cn("flex items-center gap-3 text-[14px] text-brand-muted", className)}>
      {q.photo?.url ? <Image className={avatar} src={q.photo.url} alt="" width={44} height={44} /> : <span className={cn(avatar, "grid place-items-center font-display text-[15px] font-bold leading-[normal] text-brand-ink")} aria-hidden="true">{initials(q.name)}</span>}
      <span><b className="text-brand-ink">{q.name}</b><br />{localize(q.role, locale)}</span>
    </figcaption>
  );
}

/** One large quote, the rest smaller beside it: voices, not a row of identical cards. */
export function Testimonials({ block, locale }: BlockProps<TestimonialsBlock>) {
  const [lead, ...rest] = block.items;
  return (
    <Section tone="alt">
      <Container>
        {block.heading && <Reveal><SectionHead heading={localize(block.heading, locale)} /></Reveal>}
        <div className="mt-[52px] grid grid-cols-[1.35fr_1fr] items-start gap-[72px] max-[860px]:grid-cols-1 max-[860px]:gap-10">
          <Reveal>
            <figure>
              <blockquote className="relative m-0 pt-[70px] font-display text-[clamp(28px,3.4vw,46px)] leading-[1.12] font-bold tracking-[-0.025em] before:absolute before:top-[-14px] before:left-[-4px] before:font-display before:text-[150px] before:leading-none before:font-extrabold before:text-brand-accent before:content-['\201C']">{localize(lead.quote, locale)}</blockquote>
              <Who q={lead} locale={locale} className="mt-7" />
            </figure>
          </Reveal>
          <div>
            {rest.map((q, i) => (
              <Reveal key={q.name} i={i + 1}>
                <figure className="mb-9 border-t border-brand-ink pt-[22px]">
                  <blockquote className="m-0 font-display text-[19px] leading-[1.45] font-medium">{localize(q.quote, locale)}</blockquote>
                  <Who q={q} locale={locale} className="mt-4" />
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
