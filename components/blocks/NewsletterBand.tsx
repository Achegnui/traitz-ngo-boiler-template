import { Container } from "@/components/ui/Section";
import { headingXl } from "@/components/ui/typography";
import { localize } from "@/lib/i18n";
import type { NewsletterBandBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NewsletterForm } from "./NewsletterForm";
import type { BlockProps } from "./types";

export function NewsletterBand({ block, locale }: BlockProps<NewsletterBandBlock>) {
  return (
    <section className="contour-dark relative overflow-hidden bg-brand-accent py-16 text-brand-anchor">
      <Container className="relative z-2 flex flex-wrap items-center justify-between gap-8">
        <div>
          <h2 className={cn(headingXl, "text-[36px]")}>{localize(block.heading, locale)}</h2>
          {block.body && <p>{localize(block.body, locale)}</p>}
        </div>
        <NewsletterForm placeholder={localize(block.placeholder, locale)} button={localize(block.button, locale)} />
      </Container>
    </section>
  );
}
