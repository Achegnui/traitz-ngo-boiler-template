import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { AppLink } from "@/components/ui/AppLink";
import { NewsIndex } from "@/components/ui/NewsIndex";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { moreLink } from "@/components/ui/typography";
import { getNews } from "@/lib/data";
import { localize } from "@/lib/i18n";
import type { NewsGridBlock } from "@/lib/types";
import type { BlockProps } from "./types";

export async function NewsGrid({ block, locale }: BlockProps<NewsGridBlock>) {
  const [items, tr] = await Promise.all([getNews(block.limit), getTranslations({ locale, namespace: "common" })]);
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHead heading={localize(block.heading, locale)} />
        </Reveal>
        <Reveal><NewsIndex items={items} locale={locale} /></Reveal>
        <p className="mt-7 text-right"><AppLink href="/news" className={moreLink}>{tr("viewAll")} <ArrowUpRight size={16} aria-hidden="true" /></AppLink></p>
      </Container>
    </Section>
  );
}
