import { ContactInfo } from "@/components/blocks/ContactInfo";
import { DonateCallout } from "@/components/blocks/DonateCallout";
import { EventList } from "@/components/blocks/EventList";
import { Faq } from "@/components/blocks/Faq";
import { Hero } from "@/components/blocks/Hero";
import { MissionSplit } from "@/components/blocks/MissionSplit";
import { NewsGrid } from "@/components/blocks/NewsGrid";
import { NewsletterBand } from "@/components/blocks/NewsletterBand";
import { PageHeader } from "@/components/blocks/PageHeader";
import { PartnerWall } from "@/components/blocks/PartnerWall";
import { PillarCards } from "@/components/blocks/PillarCards";
import { ProgrammeGrid } from "@/components/blocks/ProgrammeGrid";
import { ReportsLibrary } from "@/components/blocks/ReportsLibrary";
import { RichText } from "@/components/blocks/RichText";
import { StatStrip } from "@/components/blocks/StatStrip";
import { StoryFeature } from "@/components/blocks/StoryFeature";
import { TeamGrid } from "@/components/blocks/TeamGrid";
import { Testimonials } from "@/components/blocks/Testimonials";
import { Timeline } from "@/components/blocks/Timeline";
import type { Locale } from "@/i18n/routing";
import type { Block } from "@/lib/types";

function BlockSwitch({ block, locale }: { block: Block; locale: Locale }) {
  switch (block.type) {
    case "hero": return <Hero block={block} locale={locale} />;
    case "statStrip": return <StatStrip block={block} locale={locale} />;
    case "pillarCards": return <PillarCards block={block} locale={locale} />;
    case "missionSplit": return <MissionSplit block={block} locale={locale} />;
    case "programmeGrid": return <ProgrammeGrid block={block} locale={locale} />;
    case "partnerWall": return <PartnerWall block={block} locale={locale} />;
    case "storyFeature": return <StoryFeature block={block} locale={locale} />;
    case "testimonials": return <Testimonials block={block} locale={locale} />;
    case "newsGrid": return <NewsGrid block={block} locale={locale} />;
    case "newsletterBand": return <NewsletterBand block={block} locale={locale} />;
    case "donateCallout": return <DonateCallout block={block} locale={locale} />;
    case "richText": return <RichText block={block} locale={locale} />;
    case "pageHeader": return <PageHeader block={block} locale={locale} />;
    case "timeline": return <Timeline block={block} locale={locale} />;
    case "teamGrid": return <TeamGrid block={block} locale={locale} />;
    case "faq": return <Faq block={block} locale={locale} />;
    case "eventList": return <EventList block={block} locale={locale} />;
    case "reportsLibrary": return <ReportsLibrary block={block} locale={locale} />;
    case "contactInfo": return <ContactInfo block={block} locale={locale} />;
    default: {
      const unreachable: never = block; // adding a Block type without a renderer fails the typecheck
      void unreachable;
      return null; // a block type typed into the console that has no renderer is skipped, not fatal
    }
  }
}

/** Renders a page document's ordered blocks. The admin page editor (Phase 3) only reorders this array. */
export function BlockRenderer({ blocks, locale }: { blocks: Block[]; locale: Locale }) {
  return <>{blocks.map((b) => <BlockSwitch key={b.id} block={b} locale={locale} />)}</>;
}
