import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { SectionHead } from "@/components/ui/SectionHead";
import { leadClass, listReset, monoLabel, ruleTop } from "@/components/ui/typography";
import { getReports } from "@/lib/data";
import { mb } from "@/lib/format";
import { localize } from "@/lib/i18n";
import type { ReportsLibraryBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

export async function ReportsLibrary({ block, locale }: BlockProps<ReportsLibraryBlock>) {
  const Item = block.heading ? "h3" : "h2";
  const [reports, tr] = await Promise.all([getReports(), getTranslations({ locale, namespace: "common" })]);
  return (
    <Section>
      <Container>
        {block.heading && <Reveal><SectionHead heading={localize(block.heading, locale)} /></Reveal>}
        {reports.length === 0 ? <p className={leadClass}>{localize(block.emptyText, locale)}</p> : (
          <ul className={cn(listReset, "mt-10", ruleTop)}>
            {reports.map((r, i) => (
              <li key={r.id}>
                <Reveal i={i % 3} className="grid grid-cols-[150px_1fr_auto] items-center gap-6 border-b border-border py-[26px] max-[700px]:grid-cols-1 max-[700px]:gap-2">
                  <span className="font-display text-[clamp(36px,4vw,56px)] leading-none font-extrabold tracking-[-0.04em]">{r.year}</span>
                  <Item className={block.heading ? "text-[24px]" : undefined}>{localize(r.title, locale)}</Item>
                  <a className="inline-flex items-center gap-2 border-b-2 border-brand-accent pb-0.5 font-bold whitespace-nowrap" href={r.fileUrl} download target="_blank" rel="noopener noreferrer">
                    <Download size={18} aria-hidden="true" /> {tr("download")}{r.fileSizeBytes ? <span className={monoLabel}> · {mb(r.fileSizeBytes)}</span> : null}
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
