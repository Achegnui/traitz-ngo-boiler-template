import type { ArtRef } from "@/lib/art";
import type { Grad } from "@/lib/utils";
import type { Localized } from "@/lib/i18n";

/* ---------- shared pieces ---------- */

/** Matches the coverImage shape in spec section 4. `gradient` is a Phase 1 placeholder until real photos exist. */
export type ImageRef = {
  /** A photo: https link (Cloudinary) or a path under /public such as /photos/wum.jpg. */
  url?: string;
  /** Illustrated stand-in used until a photo exists. */
  art?: ArtRef;
  /** Older placeholder, still rendered if present. */
  gradient?: Grad;
  /** Empty alt marks the image as decorative. */
  alt: Localized;
  consentGiven?: boolean;
  caption?: Localized;
};
export type Cta = { label: Localized; href: string };
/** `value` is numeric so it can count up; prefix/suffix cover "+" and "%". */
export type Stat = { value: number; prefix?: string; suffix?: string; label: Localized };

/* ---------- collection documents (spec section 4) ---------- */

/** `id` is the Firestore document id (added on read, not stored in the document). Dates are ISO strings. */
type DocBase = { id: string; status: "draft" | "published"; createdAt?: string; updatedAt?: string };
type Doc = DocBase & { slug: string };

export type Programme = Doc & {
  title: Localized; summary: Localized; body?: Localized; coverImage: ImageRef;
  fundingGoal?: number; fundingRaised?: number; order: number;
};
export type Story = Doc & { title: Localized; excerpt: Localized; body?: Localized; coverImage: ImageRef; publishedAt: string };
export type NewsItem = Doc & {
  title: Localized; excerpt?: Localized; body?: Localized; coverImage: ImageRef; category: Localized; publishedAt: string;
};
export type Partner = Doc & { name: string; logoUrl?: string; websiteUrl?: string; order: number };
export type EventItem = DocBase & { title: Localized; description: Localized; startsAt: string; endsAt?: string; location: Localized };
export type Report = DocBase & { title: Localized; year: number; fileUrl: string; fileSizeBytes?: number };
export type TeamMember = DocBase & { name: string; role: Localized; bio: Localized; photo: ImageRef; order: number };

/* ---------- page builder blocks (spec section 4.1) ---------- */

type BlockBase = { id: string };

export type HeroBlock = BlockBase & {
  type: "hero";
  /** "\n" renders as a line break. */
  headline: Localized;
  /** The phrase inside `headline` picked out in the accent colour. */
  accentWord: Localized;
  sub: Localized;
  image: ImageRef;
  liveTag?: Localized;
  ctaPrimary: Cta;
  ctaSecondary?: Cta;
  /** Floating card from spec 3.1. The CTAs above render inside it when present. */
  card?: { text: Localized; stats: Stat[] };
};
export type StatStripBlock = BlockBase & { type: "statStrip"; stats: Stat[] };
export type PillarCardsBlock = BlockBase & {
  type: "pillarCards"; heading?: Localized; cards: { icon: string; title: Localized; body: Localized }[];
};
export type MissionSplitBlock = BlockBase & {
  type: "missionSplit"; kicker?: Localized; heading: Localized; body: Localized; image: ImageRef; ctaPrimary: Cta; ctaSecondary?: Cta;
};
export type ProgrammeGridBlock = BlockBase & {
  type: "programmeGrid"; heading: Localized; fundLabel: Localized; programmeRefs: string[]; showProgress: boolean;
};
export type PartnerWallBlock = BlockBase & { type: "partnerWall"; heading?: Localized };
export type StoryFeatureBlock = BlockBase & { type: "storyFeature"; kicker?: Localized; storyRef: string; ctaLabel: Localized };
export type TestimonialsBlock = BlockBase & {
  type: "testimonials"; heading?: Localized; items: { quote: Localized; name: string; role: Localized; photo?: ImageRef }[];
};
export type NewsGridBlock = BlockBase & { type: "newsGrid"; heading: Localized; limit?: number };
export type NewsletterBandBlock = BlockBase & {
  type: "newsletterBand"; heading: Localized; body?: Localized; placeholder: Localized; button: Localized;
};
export type DonateCalloutBlock = BlockBase & { type: "donateCallout"; heading: Localized; body: Localized; cta: Cta };
export type RichTextBlock = BlockBase & { type: "richText"; content: Localized };

export type PageHeaderBlock = BlockBase & { type: "pageHeader"; kicker?: Localized; heading: Localized; intro?: Localized };
export type TimelineBlock = BlockBase & { type: "timeline"; heading?: Localized; items: { year: string; title: Localized; body: Localized }[] };
export type TeamGridBlock = BlockBase & { type: "teamGrid"; heading?: Localized; intro?: Localized };
export type FaqBlock = BlockBase & { type: "faq"; heading?: Localized; items: { q: Localized; a: Localized }[] };
export type EventListBlock = BlockBase & { type: "eventList"; heading?: Localized; emptyText: Localized };
export type ReportsLibraryBlock = BlockBase & { type: "reportsLibrary"; heading?: Localized; emptyText: Localized };
export type ContactInfoBlock = BlockBase & {
  type: "contactInfo"; heading?: Localized; intro?: Localized; items: { icon: string; label: Localized; value: Localized; href?: string }[];
};

export type Block =
  | HeroBlock | StatStripBlock | PillarCardsBlock | MissionSplitBlock | ProgrammeGridBlock | PartnerWallBlock
  | StoryFeatureBlock | TestimonialsBlock | NewsGridBlock | NewsletterBandBlock | DonateCalloutBlock | RichTextBlock
  | PageHeaderBlock | TimelineBlock | TeamGridBlock | FaqBlock | EventListBlock | ReportsLibraryBlock | ContactInfoBlock;

export type Seo = { title: Localized; description: Localized };

/** /pages/{slug} */
export type PageDoc = { slug: string; status: "draft" | "published"; title: Localized; seo: Seo; blocks: Block[]; createdAt?: string; updatedAt?: string };

/** Site-wide chrome (header, footer, meta). Becomes a settings document in Phase 2. */
export type SiteContent = {
  meta: { description: Localized };
  organization: { areaServed: string; addressLocality: string; addressCountry: string };
  /** SEO copy for planned routes whose pages are not built yet (path without locale). */
  routeMeta: Record<string, Seo>;
  header: { nav: Cta[]; cta: Cta };
  footer: { about: Localized; columns: { title: Localized; links: Cta[] }[]; copy: Localized };
};

/* ---------- admin ---------- */
export type Role = "administrator" | "editor" | "contributor";
/** /admins/{uid} */
export type AdminRecord = { email: string; role: Role; displayName: string };
