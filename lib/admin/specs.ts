import type { ZodType } from "zod";
import { eventSchema, newsSchema, partnerSchema, programmeSchema, reportSchema, storySchema, teamSchema } from "@/lib/schemas";
import type { Block } from "@/lib/types";
import { ICON_OPTIONS } from "@/lib/icons";
import { newId, type Field } from "./fields";
import type { Raw } from "./types";

/* ---------- small builders ---------- */
type Opt = { optional?: boolean; hint?: string; multiline?: boolean; rows?: number };
const loc = (key: string, label: string, o: Opt = {}): Field => ({ kind: "localized", key, label, ...o });
const text = (key: string, label: string, o: Opt & { input?: "text" | "url" | "email" } = {}): Field => ({ kind: "text", key, label, ...o });
const num = (key: string, label: string, o: Opt & { min?: number; step?: number } = {}): Field => ({ kind: "number", key, label, ...o });
const cta = (key: string, label: string, optional = false): Field => ({ kind: "cta", key, label, optional });
const img = (key: string, label: string, people = false, optional = false): Field => ({ kind: "image", key, label, people, optional });
const E = (): Raw => ({ en: "" });
const blankCta = (): Raw => ({ label: E(), href: "" });
const blankImg = (): Raw => ({ alt: E() });

const statFields: Field[] = [
  num("value", "Number", { hint: "For example 12400. It counts up when visitors scroll to it." }),
  text("prefix", "Before the number", { optional: true, hint: "Optional, for example $" }),
  text("suffix", "After the number", { optional: true, hint: "Optional, for example + or %" }),
  loc("label", "Label"),
];
const statList = (key: string): Field => ({
  kind: "list", key, label: "Numbers", item: statFields, itemTitle: "label", addLabel: "Add a number", blank: () => ({ value: undefined, label: E() }),
});

/* ---------- page-builder blocks (spec 4.1) ---------- */
export type BlockType = Block["type"];
export type BlockSpec = { label: string; help: string; fields: Field[]; blank: () => Raw };

export const BLOCKS: Record<BlockType, BlockSpec> = {
  hero: {
    label: "Hero (big banner)", help: "The large opening banner with the headline and a floating summary card.",
    fields: [
      loc("headline", "Headline", { multiline: true, rows: 3, hint: "Press Enter for a new line. About three short lines works best." }),
      loc("accentWord", "Words shown in colour", { hint: "Copy a few words exactly as they appear in the headline." }),
      loc("sub", "Supporting sentence", { multiline: true, rows: 3 }),
      img("image", "Background photo"),
      loc("liveTag", "Small badge (top right)", { optional: true, hint: "For example: Live: Wum Water Project" }),
      cta("ctaPrimary", "Main button"),
      cta("ctaSecondary", "Second button", true),
      { kind: "object", key: "card", label: "Floating card", optional: true, addLabel: "Add the floating card", blank: () => ({ text: E(), stats: [] }),
        fields: [loc("text", "Card text", { multiline: true, rows: 2 }), statList("stats")] },
    ],
    blank: () => ({ headline: E(), accentWord: E(), sub: E(), image: blankImg(), ctaPrimary: blankCta() }),
  },
  statStrip: { label: "Numbers strip", help: "A row of big numbers that count up.", fields: [statList("stats")], blank: () => ({ stats: [{ value: undefined, label: E() }] }) },
  pillarCards: {
    label: "Cards (what we do)", help: "A row of short cards, each with an icon, a title and a sentence.",
    fields: [
      loc("heading", "Heading", { optional: true }),
      { kind: "list", key: "cards", label: "Cards", itemTitle: "title", addLabel: "Add a card", blank: () => ({ icon: "", title: E(), body: E() }),
        item: [{ kind: "select", key: "icon", label: "Icon", options: ICON_OPTIONS }, loc("title", "Title"), loc("body", "Text", { multiline: true, rows: 3 })] },
    ],
    blank: () => ({ cards: [{ icon: "", title: E(), body: E() }] }),
  },
  missionSplit: {
    label: "Photo and text", help: "A photo on one side, a heading and paragraph on the other.",
    fields: [loc("kicker", "Small label above", { optional: true }), loc("heading", "Heading"), loc("body", "Text", { multiline: true, rows: 4 }), img("image", "Photo", true), cta("ctaPrimary", "Main button"), cta("ctaSecondary", "Second button", true)],
    blank: () => ({ heading: E(), body: E(), image: blankImg(), ctaPrimary: blankCta() }),
  },
  programmeGrid: {
    label: "Programmes", help: "Cards for the programmes you choose, with funding progress.",
    fields: [loc("heading", "Heading"), loc("fundLabel", "Button text on each card", { hint: "For example: Fund this" }),
      { kind: "refList", key: "programmeRefs", label: "Programmes to show", collection: "programmes", hint: "Only published programmes appear on the site." },
      { kind: "checkbox", key: "showProgress", label: "Show the funding progress bar", optional: true }],
    blank: () => ({ heading: E(), fundLabel: { en: "Fund this" }, programmeRefs: [], showProgress: true }),
  },
  partnerWall: { label: "Partners", help: "The partner logos, managed under Partners.", fields: [loc("heading", "Heading", { optional: true })], blank: () => ({}) },
  storyFeature: {
    label: "Featured story", help: "One story from Stories, shown large.",
    fields: [loc("kicker", "Small label above", { optional: true }), { kind: "ref", key: "storyRef", label: "Story", collection: "stories" }, loc("ctaLabel", "Button text", { hint: "For example: Read the full story" })],
    blank: () => ({ storyRef: "", ctaLabel: E() }),
  },
  testimonials: {
    label: "Quotes", help: "What people say about the work.",
    fields: [loc("heading", "Heading", { optional: true }),
      { kind: "list", key: "items", label: "Quotes", itemTitle: "name", addLabel: "Add a quote", blank: () => ({ quote: E(), name: "", role: E() }),
        item: [loc("quote", "Quote", { multiline: true, rows: 3 }), text("name", "Name"), loc("role", "Role or place"), img("photo", "Photo", true, true)] }],
    blank: () => ({ items: [{ quote: E(), name: "", role: E() }] }),
  },
  newsGrid: { label: "Latest news", help: "The newest published news posts, shown automatically.", fields: [loc("heading", "Heading"), num("limit", "How many posts", { optional: true, hint: "Between 1 and 12. Default is all.", })], blank: () => ({ heading: E(), limit: 3 }) },
  newsletterBand: {
    label: "Newsletter sign-up", help: "A coloured band with an email box.",
    fields: [loc("heading", "Heading"), loc("body", "Text", { optional: true }), loc("placeholder", "Email box hint", { hint: "For example: Your email" }), loc("button", "Button text")],
    blank: () => ({ heading: E(), placeholder: { en: "Your email" }, button: { en: "Subscribe" } }),
  },
  donateCallout: { label: "Donate call-out", help: "A short appeal with a donate button.", fields: [loc("heading", "Heading"), loc("body", "Text", { multiline: true, rows: 3 }), cta("cta", "Button")], blank: () => ({ heading: E(), body: E(), cta: { label: { en: "Donate" }, href: "/donate" } }) },
  pageHeader: {
    label: "Page title banner", help: "The big title at the top of an inner page. Gives the page its main heading.",
    fields: [loc("kicker", "Small label above", { optional: true }), loc("heading", "Page title"), loc("intro", "Introduction", { optional: true, multiline: true, rows: 3 })],
    blank: () => ({ heading: E() }),
  },
  timeline: {
    label: "Timeline", help: "Key moments in order, for example your history.",
    fields: [loc("heading", "Heading", { optional: true }),
      { kind: "list", key: "items", label: "Moments", itemTitle: "title", addLabel: "Add a moment", blank: () => ({ year: "", title: E(), body: E() }),
        item: [text("year", "Year", { hint: "For example 2019" }), loc("title", "Title"), loc("body", "What happened", { multiline: true, rows: 3 })] }],
    blank: () => ({ items: [{ year: "", title: E(), body: E() }] }),
  },
  teamGrid: { label: "Team", help: "Everyone published under Team, shown automatically.", fields: [loc("heading", "Heading", { optional: true }), loc("intro", "Introduction", { optional: true, multiline: true, rows: 2 })], blank: () => ({}) },
  faq: {
    label: "Questions and answers", help: "Questions that open to show the answer.",
    fields: [loc("heading", "Heading", { optional: true }),
      { kind: "list", key: "items", label: "Questions", itemTitle: "q", addLabel: "Add a question", blank: () => ({ q: E(), a: E() }),
        item: [loc("q", "Question"), loc("a", "Answer", { multiline: true, rows: 4 })] }],
    blank: () => ({ items: [{ q: E(), a: E() }] }),
  },
  eventList: { label: "Events list", help: "Everything published under Events, shown automatically.", fields: [loc("heading", "Heading", { optional: true }), loc("emptyText", "Text when there are no events")], blank: () => ({ emptyText: { en: "No events are planned right now." } }) },
  reportsLibrary: { label: "Reports library", help: "Everything published under Reports, with download links.", fields: [loc("heading", "Heading", { optional: true }), loc("emptyText", "Text when there are no reports")], blank: () => ({ emptyText: { en: "Reports will appear here." } }) },
  contactInfo: {
    label: "Contact details", help: "Ways to reach you: email, phone, address, opening hours.",
    fields: [loc("heading", "Heading", { optional: true }), loc("intro", "Introduction", { optional: true, multiline: true, rows: 2 }),
      { kind: "list", key: "items", label: "Details", itemTitle: "label", addLabel: "Add a detail", blank: () => ({ icon: "mail", label: E(), value: E() }),
        item: [{ kind: "select", key: "icon", label: "Icon", options: ICON_OPTIONS }, loc("label", "Label", { hint: "For example Email" }), loc("value", "Value", { hint: "For example hello@yourorg.org" }),
          text("href", "Link", { optional: true, hint: "For example mailto:hello@yourorg.org or tel:+237600000000" })] }],
    blank: () => ({ items: [{ icon: "mail", label: E(), value: E() }] }),
  },
  richText: { label: "Text", help: "Plain paragraphs. Leave a blank line between paragraphs.", fields: [loc("content", "Text", { multiline: true, rows: 10, hint: "Leave a blank line between paragraphs." })], blank: () => ({ content: E() }) },
};

export const BLOCK_ORDER = Object.keys(BLOCKS) as BlockType[];
export const newBlock = (type: BlockType): Raw => ({ id: newId(type), type, ...BLOCKS[type].blank() });

/** A short description of a block for its collapsed header. */
export function blockSummary(b: Raw): string {
  const pick = b.headline ?? b.heading ?? b.title ?? b.content ?? b.kicker;
  return typeof pick === "object" && pick ? String(pick.en ?? "").split("\n")[0].slice(0, 70) : "";
}

export const PAGE_FIELDS: Field[] = [
  loc("title", "Page name", { hint: "Used in the admin and as a fallback page title." }),
  { kind: "object", key: "seo", label: "Search engines and social sharing", optional: false, addLabel: "", blank: () => ({ title: E(), description: E() }),
    fields: [loc("title", "Title shown in Google", { hint: "About 50 characters." }), loc("description", "Description shown in Google", { multiline: true, rows: 3, hint: "One or two sentences, about 150 characters." })] },
];

/* ---------- collections (spec 4) ---------- */
export type CollectionConfig = {
  key: string; label: string; singular: string; schema: ZodType<unknown>; fields: Field[]; blank: () => Raw;
  /** Field that names a document in lists and in its address. */
  titleKey: string;
  /** field: editable slug (the page address). hidden: made from the title. none: no slug stored. */
  slug: "field" | "hidden" | "none";
  columns: { header: string; value: (d: Raw) => string }[];
  sort: (a: Raw, b: Raw) => number;
  /** Where the post lives on the public site, if it has its own page. */
  publicPath?: (d: Raw) => string | null;
};

const today = () => new Date().toISOString().slice(0, 10);
const byOrder = (a: Raw, b: Raw) => (a.order ?? 0) - (b.order ?? 0);
const byDateDesc = (k: string) => (a: Raw, b: Raw) => String(b[k] ?? "").localeCompare(String(a[k] ?? ""));
const enOf = (v: Raw | undefined) => String(v?.en ?? "");
const slugField = text("slug", "Page address (slug)", { hint: "Lowercase letters, numbers and hyphens. Becomes part of the web address. Filled in from the title." });

export const COLLECTIONS: Record<string, CollectionConfig> = {
  programmes: {
    key: "programmes", label: "Programmes", singular: "programme", schema: programmeSchema, titleKey: "title", slug: "field",
    fields: [loc("title", "Title"), slugField, loc("summary", "Short summary", { multiline: true, rows: 3 }), loc("body", "Full description", { optional: true, multiline: true, rows: 8, hint: "Leave a blank line between paragraphs." }),
      img("coverImage", "Cover photo", true), num("fundingGoal", "Funding goal (XAF)", { optional: true, min: 0 }), num("fundingRaised", "Raised so far (XAF)", { optional: true, min: 0 }), num("order", "Order", { hint: "Lower numbers come first." })],
    blank: () => ({ slug: "", title: E(), summary: E(), coverImage: blankImg(), order: 10 }),
    columns: [{ header: "Order", value: (d) => String(d.order ?? "") }, { header: "Raised", value: (d) => (d.fundingGoal ? `${Math.round(((d.fundingRaised ?? 0) / d.fundingGoal) * 100)}%` : "") }],
    sort: byOrder, publicPath: (d) => `/programmes/${d.slug}`,
  },
  stories: {
    key: "stories", label: "Stories", singular: "story", schema: storySchema, titleKey: "title", slug: "field",
    fields: [loc("title", "Title"), slugField, loc("excerpt", "Short summary", { multiline: true, rows: 3 }), loc("body", "Full story", { optional: true, multiline: true, rows: 10, hint: "Leave a blank line between paragraphs." }), img("coverImage", "Cover photo", true), { kind: "date", key: "publishedAt", label: "Date" }],
    blank: () => ({ slug: "", title: E(), excerpt: E(), coverImage: blankImg(), publishedAt: today() }),
    columns: [{ header: "Date", value: (d) => String(d.publishedAt ?? "") }], sort: byDateDesc("publishedAt"), publicPath: (d) => `/stories/${d.slug}`,
  },
  news: {
    key: "news", label: "News", singular: "news post", schema: newsSchema, titleKey: "title", slug: "field",
    fields: [loc("title", "Title"), slugField, loc("category", "Category", { hint: "For example: Water, Education, Reports." }),
      loc("excerpt", "Short summary", { multiline: true, rows: 3, hint: "One or two sentences. Shown on cards and in Google results." }),
      loc("body", "Article text", { multiline: true, rows: 12, hint: "Leave a blank line between paragraphs." }),
      img("coverImage", "Cover photo", true), { kind: "date", key: "publishedAt", label: "Date" }],
    blank: () => ({ slug: "", title: E(), category: E(), excerpt: E(), body: E(), coverImage: blankImg(), publishedAt: today() }),
    columns: [{ header: "Date", value: (d) => String(d.publishedAt ?? "") }, { header: "Category", value: (d) => enOf(d.category) }], sort: byDateDesc("publishedAt"), publicPath: (d) => `/news/${d.slug}`,
  },
  events: {
    key: "events", label: "Events", singular: "event", schema: eventSchema, titleKey: "title", slug: "none",
    fields: [loc("title", "Title"), loc("description", "Description", { multiline: true, rows: 5 }), { kind: "datetime", key: "startsAt", label: "Starts" }, { kind: "datetime", key: "endsAt", label: "Ends", optional: true }, loc("location", "Where")],
    blank: () => ({ title: E(), description: E(), startsAt: "", location: E() }),
    columns: [{ header: "Starts", value: (d) => String(d.startsAt ?? "").replace("T", " ") }, { header: "Where", value: (d) => enOf(d.location) }], sort: byDateDesc("startsAt"),
  },
  reports: {
    key: "reports", label: "Reports", singular: "report", schema: reportSchema, titleKey: "title", slug: "none",
    fields: [loc("title", "Title"), num("year", "Year"), { kind: "file", key: "fileUrl", label: "PDF file", sizeKey: "fileSizeBytes", media: "pdf" }],
    blank: () => ({ title: E(), year: new Date().getFullYear(), fileUrl: "" }),
    columns: [{ header: "Year", value: (d) => String(d.year ?? "") }, { header: "Size", value: (d) => (d.fileSizeBytes ? (d.fileSizeBytes < 1048576 ? `${Math.max(1, Math.round(d.fileSizeBytes / 1024))} KB` : `${(d.fileSizeBytes / 1048576).toFixed(1)} MB`) : "") }], sort: (a, b) => (b.year ?? 0) - (a.year ?? 0),
  },
  team: {
    key: "team", label: "Team", singular: "team member", schema: teamSchema, titleKey: "name", slug: "none",
    fields: [text("name", "Name"), loc("role", "Role"), loc("bio", "Short bio", { multiline: true, rows: 3 }), img("photo", "Photo", true), num("order", "Order", { hint: "Lower numbers come first." })],
    blank: () => ({ name: "", role: E(), bio: E(), photo: blankImg(), order: 10 }),
    columns: [{ header: "Role", value: (d) => enOf(d.role) }, { header: "Order", value: (d) => String(d.order ?? "") }], sort: byOrder,
  },
  partners: {
    key: "partners", label: "Partners", singular: "partner", schema: partnerSchema, titleKey: "name", slug: "hidden",
    fields: [text("name", "Name"), text("websiteUrl", "Website", { input: "url", optional: true, hint: "Full link, for example https://example.org" }),
      { kind: "file", key: "logoUrl", label: "Logo", media: "image", optional: true, hint: "Without a logo the name is shown as text." } as Field, num("order", "Order", { hint: "Lower numbers come first." })],
    blank: () => ({ name: "", order: 10 }),
    columns: [{ header: "Order", value: (d) => String(d.order ?? "") }], sort: byOrder,
  },
};
export const COLLECTION_KEYS = Object.keys(COLLECTIONS);
