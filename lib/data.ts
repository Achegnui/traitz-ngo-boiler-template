import type { ZodType } from "zod";
import { blockSchema, eventSchema, newsSchema, pageShell, partnerSchema, programmeSchema, reportSchema, siteSchema, storySchema, teamSchema } from "@/lib/schemas";
import { readDoc, readPublished, type WithId } from "@/lib/source";
export { servedFallback } from "@/lib/source";
import type { Block, EventItem, NewsItem, PageDoc, Partner, Programme, Report, SiteContent, Story, TeamMember } from "@/lib/types";

/**
 * The single data seam. Every component reads through these functions; they read Firestore and only
 * return published documents that pass validation. A malformed document or block is skipped and logged
 * (visible in the server log) rather than crashing the page. Routes set `export const revalidate`.
 */

/** Validate one stored document; returns null (and logs why) when it is malformed. */
function valid<T>(schema: ZodType<T>, coll: string, doc: WithId<Record<string, unknown>>): WithId<T> | null {
  const { id, ...rest } = doc;
  const r = schema.safeParse(rest);
  if (r.success) return { ...r.data, id } as WithId<T>;
  console.error(`[data] ${coll}/${id} skipped: ${r.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  return null;
}
const validList = <T>(schema: ZodType<T>, coll: string, docs: WithId<Record<string, unknown>>[]) =>
  docs.map((d) => valid(schema, coll, d)).filter((d): d is WithId<T> => d !== null);

export async function getSite(): Promise<SiteContent> {
  const raw = await readDoc<Record<string, unknown>>("settings", "site");
  if (!raw) throw new Error('Firestore document settings/site is missing. Run "npm run seed" (or check DATA_SOURCE and the project id).');
  const { id: _id, ...rest } = raw;
  const r = siteSchema.safeParse(rest);
  if (!r.success) throw new Error(`settings/site is malformed: ${r.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  return r.data;
}

function toPage(raw: WithId<Record<string, unknown>>): PageDoc | null {
  const { id, blocks, ...rest } = raw;
  const shell = pageShell.safeParse(rest);
  if (!shell.success) { console.error(`[data] pages/${id} skipped: ${shell.error.issues[0]?.path.join(".")}: ${shell.error.issues[0]?.message}`); return null; }
  if (shell.data.status !== "published") return null;
  const good: Block[] = [];
  (Array.isArray(blocks) ? blocks : []).forEach((b, i) => {
    const r = blockSchema.safeParse(b);
    if (r.success) good.push(r.data);
    else console.error(`[data] pages/${id} block ${i} (${(b as { type?: string })?.type}) skipped: ${r.error.issues[0]?.path.join(".")}: ${r.error.issues[0]?.message}`);
  });
  return { ...shell.data, id, blocks: good } as unknown as PageDoc;
}

export async function getPage(slug: string): Promise<PageDoc | null> {
  const raw = await readDoc<Record<string, unknown>>("pages", slug);
  return raw ? toPage(raw) : null;
}

export async function listPages(): Promise<PageDoc[]> {
  return (await readPublished<Record<string, unknown>>("pages")).map(toPage).filter((p): p is PageDoc => p !== null);
}

export async function getProgrammes(ids: string[]): Promise<Programme[]> {
  const all = validList(programmeSchema, "programmes", await readPublished<Record<string, unknown>>("programmes"));
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Programme => Boolean(p));
}

export async function getStory(id: string): Promise<Story | null> {
  const raw = await readDoc<Record<string, unknown>>("stories", id);
  const s = raw ? valid(storySchema, "stories", raw) : null;
  return s && s.status === "published" ? s : null;
}

export async function getNews(limit?: number): Promise<NewsItem[]> {
  const all = validList(newsSchema, "news", await readPublished<Record<string, unknown>>("news"));
  const sorted = all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  return (await getNews()).find((n) => n.slug === slug) ?? null;
}

export async function getPartners(): Promise<Partner[]> {
  return validList(partnerSchema, "partners", await readPublished<Record<string, unknown>>("partners")).sort((a, b) => a.order - b.order);
}

export async function getAllProgrammes(): Promise<Programme[]> {
  return validList(programmeSchema, "programmes", await readPublished<Record<string, unknown>>("programmes")).sort((a, b) => a.order - b.order);
}
export async function getProgrammeBySlug(slug: string): Promise<Programme | null> {
  return (await getAllProgrammes()).find((p) => p.slug === slug) ?? null;
}
export async function getStories(): Promise<Story[]> {
  return validList(storySchema, "stories", await readPublished<Record<string, unknown>>("stories")).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  return (await getStories()).find((s) => s.slug === slug) ?? null;
}
export async function getTeam(): Promise<TeamMember[]> {
  return validList(teamSchema, "team", await readPublished<Record<string, unknown>>("team")).sort((a, b) => a.order - b.order);
}
export async function getEvents(): Promise<EventItem[]> {
  return validList(eventSchema, "events", await readPublished<Record<string, unknown>>("events")).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}
export async function getReports(): Promise<Report[]> {
  return validList(reportSchema, "reports", await readPublished<Record<string, unknown>>("reports")).sort((a, b) => b.year - a.year);
}
