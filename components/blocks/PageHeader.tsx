import type { ReactNode } from "react";
import { Container } from "@/components/ui/Section";
import { monoLabel, slideIn } from "@/components/ui/typography";
import { localize } from "@/lib/i18n";
import type { PageHeaderBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

/** The title banner of an inner page. It carries the page's single h1. A tinted section right after it turns white. */
export function PageBanner({ kicker, heading, intro }: { kicker?: ReactNode; heading: string; intro?: string }) {
  return (
    <header className="contour-mask-dark relative overflow-hidden border-b border-border bg-brand-tint pt-24 pb-[60px] max-[700px]:pt-16 max-[700px]:pb-10 [&+[data-tone=alt]]:bg-white">
      <Container className="relative z-2">
        {kicker && <p className={cn(monoLabel, "mb-[18px] text-brand-muted")}>{kicker}</p>}
        <h1 className={cn(slideIn, "max-w-[16ch] text-[clamp(42px,7vw,96px)] font-extrabold leading-[.98] tracking-[-0.035em]")}>{heading}</h1>
        {intro && <p className="mt-[22px] max-w-[640px] text-[clamp(18px,1.6vw,22px)] text-brand-muted">{intro}</p>}
      </Container>
    </header>
  );
}

export function PageHeader({ block, locale }: BlockProps<PageHeaderBlock>) {
  return (
    <PageBanner
      kicker={block.kicker ? localize(block.kicker, locale) : undefined}
      heading={localize(block.heading, locale)}
      intro={block.intro ? localize(block.intro, locale) : undefined}
    />
  );
}
