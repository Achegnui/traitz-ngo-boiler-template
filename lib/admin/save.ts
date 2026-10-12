import type { ZodType } from "zod";
import { issuePaths } from "@/lib/schemas";
import { backend } from "./backend";
import { describePath, prune, slugify, type Field } from "./fields";
import { BLOCKS, type BlockType } from "./specs";
import type { Raw } from "./types";

export type Mode = "draft" | "published";
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Turns what the form holds into what gets stored, and checks it.
 * Publishing needs a complete, valid document. A draft only needs a title (and a valid address), so work in
 * progress can be saved.
 */
export function prepare(raw: Raw, o: {
  fields: Field[]; schema: ZodType<unknown>; mode: Mode; titleKey: string; slug?: boolean; extra?: (d: Raw) => Record<string, string>;
}): { data: Raw; errors: Record<string, string> } {
  const { id: _id, ...rest } = raw;
  const data: Raw = { ...prune(rest, o.fields), status: o.mode, updatedAt: new Date().toISOString() };
  let errors: Record<string, string> = {};
  if (o.mode === "published") {
    const r = o.schema.safeParse(data);
    if (!r.success) errors = issuePaths(r.error);
    errors = { ...errors, ...(o.extra?.(data) ?? {}) };
  } else {
    const t = data[o.titleKey];
    const has = typeof t === "string" ? t.trim() : String(t?.en ?? "").trim();
    if (!has) errors[typeof t === "string" || o.titleKey === "name" ? o.titleKey : `${o.titleKey}.en`] = "Add a title before saving";
    if (o.slug && data.slug && !SLUG.test(String(data.slug))) errors.slug = "Use lowercase letters, numbers and hyphens only";
  }
  return { data, errors };
}

/** Hero rule: the coloured words must be copied from the headline, otherwise they would silently not show. */
export function heroAccentErrors(block: Raw, prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const lang of ["en", "fr"] as const) {
    const h = String(block.headline?.[lang] ?? ""), a = String(block.accentWord?.[lang] ?? "");
    if (a && !h.includes(a)) out[`${prefix}.accentWord.${lang}`] = "These words must appear exactly as written in the headline";
  }
  return out;
}

export function pageExtraErrors(page: Raw): Record<string, string> {
  const out: Record<string, string> = {};
  const seen = new Set<string>();
  (page.blocks ?? []).forEach((b: Raw, i: number) => {
    if (seen.has(b.id)) out[`blocks.${i}`] = "Duplicate block id";
    seen.add(b.id);
    if (b.type === "hero") Object.assign(out, heroAccentErrors(b, `blocks.${i}`));
  });
  return out;
}

/** An id for documents without a slug. */
export async function uniqueId(collection: string, base: string): Promise<string> {
  const root = slugify(base) || "item";
  for (let n = 1; n < 50; n++) {
    const id = n === 1 ? root : `${root}-${n}`;
    if (!(await backend.get(collection, id))) return id;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/** Best effort: makes the public site pick up the change straight away (otherwise it takes up to 30 seconds). */
export async function revalidateSite(): Promise<void> {
  if (process.env.NEXT_PUBLIC_ADMIN_BACKEND === "fake") return; // no server session to check in offline test mode
  try {
    await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${await backend.idToken()}` } });
  } catch { /* the site still updates on its own within 30 seconds */ }
}

/** Error label using the field names people see on screen. */
export const labelFor = (key: string, fields: Field[], blocks?: Raw[]) => describePath(key, fields, blocks, BLOCKS);

export function explainError(e: unknown): string {
  const code = (e as { code?: string })?.code;
  if (code === "permission-denied") return "You do not have permission to do that. If you are a contributor, you can only create and edit drafts.";
  if (code === "unavailable" || code === "auth/network-request-failed") return "No connection. Check your internet and try again.";
  return e instanceof Error ? e.message : "Something went wrong. Please try again.";
}
