import { z } from "zod";
import type { Block, EventItem, NewsItem, PageDoc, Partner, Programme, Report, SiteContent, Story, TeamMember } from "@/lib/types";

/**
 * One set of schemas for everything stored in Firestore. The admin forms use them to reject bad input
 * before saving, and the public site uses them to skip anything malformed instead of crashing.
 */

const nonBlank = z.string().refine((s) => s.trim().length > 0, "Required");
const optText = z.string().optional();

export const localized = z.object({ en: nonBlank, fr: optText });
/** For optional fields: English may be empty. */
export const localizedOpt = z.object({ en: z.string(), fr: optText });

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only (for example: school-kits-2026)");
const href = z.string().refine((s) => /^(\/|https?:\/\/|mailto:|tel:|#)/.test(s), "Use a page path like /donate or a full link starting with https://");
import { ART_MOTIFS } from "@/lib/art";
/** A photo link: https URL (Cloudinary) or a site path such as /photos/wum.jpg. */
const photoUrl = z.string().refine(
  (v) =>
    /^https?:\/\/\S+$/.test(v) ||
    /^\/[\w\-./]+$/.test(v) ||
    // test-only: the in-memory admin backend embeds uploads as data: URLs. The constant is "firebase" in real builds.
    (process.env.NEXT_PUBLIC_ADMIN_BACKEND === "fake" && /^data:image\//.test(v)),
  "Use a full link starting with https:// or a path like /photos/name.jpg",
);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Pick a date");
const status = z.enum(["draft", "published"]);
const stamps = { createdAt: optText, updatedAt: optText };

export const cta = z.object({ label: localized, href });

/** `people`: photographs of people need a consent tick before they can be published. */
export const imageRef = (people = false) =>
  z
    .object({
      url: photoUrl.optional(),
      art: z.object({ motif: z.enum(ART_MOTIFS), seed: z.number().optional() }).optional(),
      gradient: z.tuple([z.string(), z.string()]).optional(),
      alt: localizedOpt,
      consentGiven: z.boolean().optional(),
      caption: localizedOpt.optional(),
    })
    .superRefine((v, ctx) => {
      if (!v.url) return;
      if (!v.alt.en.trim()) ctx.addIssue({ code: "custom", path: ["alt", "en"], message: "Describe the image for people using screen readers" });
      if (people && !v.consentGiven) ctx.addIssue({ code: "custom", path: ["consentGiven"], message: "Confirm you have permission to publish this photo" });
    });

export const stat = z.object({ value: z.number("Enter a number"), prefix: optText, suffix: optText, label: localized });

/* ---------- blocks (spec 4.1) ---------- */
const id = z.string().min(1);
const blocks = {
  hero: z.object({
    id, type: z.literal("hero"), headline: localized, accentWord: localized, sub: localized, image: imageRef(false),
    liveTag: localizedOpt.optional(), ctaPrimary: cta, ctaSecondary: cta.optional(),
    card: z.object({ text: localized, stats: z.array(stat) }).optional(),
  }),
  statStrip: z.object({ id, type: z.literal("statStrip"), stats: z.array(stat).min(1, "Add at least one number") }),
  pillarCards: z.object({
    id, type: z.literal("pillarCards"), heading: localizedOpt.optional(),
    cards: z.array(z.object({ icon: nonBlank, title: localized, body: localized })).min(1, "Add at least one card"),
  }),
  missionSplit: z.object({
    id, type: z.literal("missionSplit"), kicker: localizedOpt.optional(), heading: localized, body: localized,
    image: imageRef(true), ctaPrimary: cta, ctaSecondary: cta.optional(),
  }),
  programmeGrid: z.object({
    id, type: z.literal("programmeGrid"), heading: localized, fundLabel: localized,
    programmeRefs: z.array(z.string()).min(1, "Choose at least one programme"), showProgress: z.boolean(),
  }),
  partnerWall: z.object({ id, type: z.literal("partnerWall"), heading: localizedOpt.optional() }),
  storyFeature: z.object({ id, type: z.literal("storyFeature"), kicker: localizedOpt.optional(), storyRef: nonBlank, ctaLabel: localized }),
  testimonials: z.object({
    id, type: z.literal("testimonials"), heading: localizedOpt.optional(),
    items: z.array(z.object({ quote: localized, name: nonBlank, role: localized, photo: imageRef(true).optional() })).min(1, "Add at least one quote"),
  }),
  newsGrid: z.object({ id, type: z.literal("newsGrid"), heading: localized, limit: z.number().int().min(1).max(12).optional() }),
  newsletterBand: z.object({
    id, type: z.literal("newsletterBand"), heading: localized, body: localizedOpt.optional(), placeholder: localized, button: localized,
  }),
  donateCallout: z.object({ id, type: z.literal("donateCallout"), heading: localized, body: localized, cta }),
  richText: z.object({ id, type: z.literal("richText"), content: localized }),
  pageHeader: z.object({ id, type: z.literal("pageHeader"), kicker: localizedOpt.optional(), heading: localized, intro: localizedOpt.optional() }),
  timeline: z.object({
    id, type: z.literal("timeline"), heading: localizedOpt.optional(),
    items: z.array(z.object({ year: nonBlank, title: localized, body: localized })).min(1, "Add at least one entry"),
  }),
  teamGrid: z.object({ id, type: z.literal("teamGrid"), heading: localizedOpt.optional(), intro: localizedOpt.optional() }),
  faq: z.object({
    id, type: z.literal("faq"), heading: localizedOpt.optional(),
    items: z.array(z.object({ q: localized, a: localized })).min(1, "Add at least one question"),
  }),
  eventList: z.object({ id, type: z.literal("eventList"), heading: localizedOpt.optional(), emptyText: localized }),
  reportsLibrary: z.object({ id, type: z.literal("reportsLibrary"), heading: localizedOpt.optional(), emptyText: localized }),
  contactInfo: z.object({
    id, type: z.literal("contactInfo"), heading: localizedOpt.optional(), intro: localizedOpt.optional(),
    items: z.array(z.object({ icon: nonBlank, label: localized, value: localized, href: href.optional() })).min(1, "Add at least one detail"),
  }),
};

export const blockSchema: z.ZodType<Block> = z.discriminatedUnion("type", [
  blocks.hero, blocks.statStrip, blocks.pillarCards, blocks.missionSplit, blocks.programmeGrid, blocks.partnerWall,
  blocks.storyFeature, blocks.testimonials, blocks.newsGrid, blocks.newsletterBand, blocks.donateCallout, blocks.richText,
  blocks.pageHeader, blocks.timeline, blocks.teamGrid, blocks.faq, blocks.eventList, blocks.reportsLibrary, blocks.contactInfo,
]) as unknown as z.ZodType<Block>;

const seo = z.object({ title: localized, description: localized });

/** The page without its blocks; blocks are validated one by one so one bad block cannot hide the page. */
export const pageShell = z.object({ slug, status, title: localized, seo, ...stamps });
export const pageSchema = pageShell.extend({ blocks: z.array(blockSchema) }) as unknown as z.ZodType<Omit<PageDoc, "id">>;

/* ---------- collections (spec 4), without the `id` that Firestore keeps as the document id ---------- */
export const programmeSchema = z.object({
  slug, status, title: localized, summary: localized, body: localizedOpt.optional(), coverImage: imageRef(true),
  fundingGoal: z.number().min(0).optional(), fundingRaised: z.number().min(0).optional(), order: z.number(), ...stamps,
}) as unknown as z.ZodType<Omit<Programme, "id">>;

export const storySchema = z.object({
  slug, status, title: localized, excerpt: localized, body: localizedOpt.optional(), coverImage: imageRef(true), publishedAt: isoDate, ...stamps,
}) as unknown as z.ZodType<Omit<Story, "id">>;

export const newsSchema = z.object({
  slug, status, title: localized, excerpt: localized, body: localized, coverImage: imageRef(true), category: localized, publishedAt: isoDate, ...stamps,
}) as unknown as z.ZodType<Omit<NewsItem, "id">>;

export const teamSchema = z.object({
  status, name: nonBlank, role: localized, bio: localized, photo: imageRef(true), order: z.number(), ...stamps,
}) as unknown as z.ZodType<Omit<TeamMember, "id">>;

export const partnerSchema = z.object({
  slug, status, name: nonBlank, logoUrl: photoUrl.optional(), websiteUrl: z.string().url("Not a valid link").optional(),
  order: z.number(), ...stamps,
}) as unknown as z.ZodType<Omit<Partner, "id">>;

export const eventSchema = z.object({
  status, title: localized, description: localized, startsAt: isoDate, endsAt: z.string().optional(), location: localized, ...stamps,
}) as unknown as z.ZodType<Omit<EventItem, "id">>;

export const reportSchema = z.object({
  status, title: localized, year: z.number().int().min(1990).max(2100), fileUrl: photoUrl,
  fileSizeBytes: z.number().optional(), ...stamps,
}) as unknown as z.ZodType<Omit<Report, "id">>;

export const siteSchema = z.object({
  meta: z.object({ description: localized }),
  organization: z.object({ areaServed: nonBlank, addressLocality: nonBlank, addressCountry: nonBlank }),
  routeMeta: z.record(z.string(), seo),
  header: z.object({ nav: z.array(cta), cta }),
  footer: z.object({ about: localized, columns: z.array(z.object({ title: localized, links: z.array(cta) })), copy: localized }),
}) as unknown as z.ZodType<SiteContent>;

/** "blocks.0.headline.en" style keys, used to attach messages to form fields. */
export function issuePaths(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const key = i.path.join(".");
    if (!(key in out)) out[key] = i.message;
  }
  return out;
}
