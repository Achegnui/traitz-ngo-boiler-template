import type { Raw } from "./types";

export type Option = { value: string; label: string };
type Base = { key: string; label: string; hint?: string; optional?: boolean };

/** A declarative description of a form. One generic editor renders every screen from these. */
export type Field = Base &
  (
    | { kind: "text"; input?: "text" | "url" | "email"; placeholder?: string }
    | { kind: "textarea"; rows?: number }
    | { kind: "number"; min?: number; step?: number }
    | { kind: "date" }
    | { kind: "datetime" }
    | { kind: "checkbox" }
    | { kind: "select"; options: Option[] }
    | { kind: "localized"; multiline?: boolean; rows?: number }
    | { kind: "cta" }
    | { kind: "image"; people?: boolean }
    | { kind: "file"; sizeKey?: string; media?: "image" | "pdf" }
    | { kind: "list"; item: Field[]; itemTitle?: string; addLabel: string; blank: () => Raw }
    | { kind: "object"; fields: Field[]; blank: () => Raw; addLabel: string }
    | { kind: "ref"; collection: string }
    | { kind: "refList"; collection: string }
  );

const loc = (l: Raw | undefined) => {
  const en = String(l?.en ?? "").trim();
  const fr = String(l?.fr ?? "").trim();
  return fr ? { en, fr } : { en };
};
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Tidy what the form produced before it is validated and saved: trim text, drop empty optional fields and empty French. */
export function prune(v: Raw, fields: Field[]): Raw {
  const out: Raw = { ...v };
  for (const f of fields) {
    const val = out[f.key];
    const drop = () => { delete out[f.key]; };
    switch (f.kind) {
      case "text": case "textarea": case "date": case "datetime": case "file": {
        const t = str(val);
        if (t) out[f.key] = t; else if (f.optional || f.kind === "file") drop(); else out[f.key] = "";
        break;
      }
      case "number":
        if (typeof val !== "number" || Number.isNaN(val)) drop();
        break;
      case "checkbox": out[f.key] = Boolean(val); break;
      case "select": case "ref": if (!val) { if (f.optional) drop(); else out[f.key] = ""; } break;
      case "localized": {
        const l = loc(val);
        if (f.optional && !l.en && !l.fr) drop(); else out[f.key] = l;
        break;
      }
      case "cta": {
        const label = loc(val?.label);
        const href = str(val?.href);
        if (f.optional && !label.en && !label.fr && !href) drop(); else out[f.key] = { label, href };
        break;
      }
      case "image": {
        const im: Raw = { ...(val ?? {}) };
        im.alt = loc(im.alt);
        const url = str(im.url);
        if (url) im.url = url; else delete im.url;
        if (im.caption) { const c = loc(im.caption); if (c.en || c.fr) im.caption = c; else delete im.caption; }
        if (!im.consentGiven) delete im.consentGiven;
        if (f.optional && !im.url && !im.gradient && !im.alt.en) drop(); else out[f.key] = im;
        break;
      }
      case "list": out[f.key] = (Array.isArray(val) ? val : []).map((it: Raw) => prune(it, f.item)); break;
      case "object": if (!val) drop(); else out[f.key] = prune(val, f.fields); break;
      case "refList": out[f.key] = Array.isArray(val) ? val : []; break;
    }
  }
  return out;
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 7)}`;

/** The sub-fields a "cta" is made of. Shared by the editor and by error labels. */
export const ctaFields = (label: string, optional?: boolean): Field[] => [
  { kind: "localized", key: "label", label: `${label}: text on the button`, optional },
  { kind: "text", key: "href", label: `${label}: where it goes`, hint: "A page on this site like /donate, or a full link like https://example.org", optional },
];

/** The sub-fields an "image" is made of. */
export const imageFields = (people?: boolean): Field[] => [
  { kind: "text", key: "url", input: "url", label: "Image link", hint: "Filled in automatically when you upload. You can also paste a link.", optional: true },
  { kind: "localized", key: "alt", label: "Describe the image", hint: "Read aloud by screen readers. Describe what is in the photo.", optional: true },
  ...(people ? [{ kind: "checkbox", key: "consentGiven", label: "I have permission to publish this photo", hint: "Required for photos of people.", optional: true } as Field] : []),
  { kind: "localized", key: "caption", label: "Caption", optional: true },
];

const humanize = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

/** "blocks.2.headline.en" -> "Block 3 (Hero): Headline (English)", using the labels people see on screen. */
export function describePath(
  key: string, fields: Field[], blocks?: Raw[], blockSpecs?: Record<string, { label: string; fields: Field[] }>,
): string {
  const parts = key.split(".");
  const out: string[] = [];
  let cur: Field[] | null = fields;
  let i = 0;
  while (i < parts.length) {
    const p = parts[i];
    if (p === "blocks" && blocks && /^\d+$/.test(parts[i + 1] ?? "")) {
      const n = Number(parts[i + 1]);
      const type = blocks[n]?.type as string | undefined;
      const spec = type ? blockSpecs?.[type] : undefined;
      out.push(`Block ${n + 1} (${spec?.label ?? type ?? "unknown"})`);
      cur = spec?.fields ?? null;
      i += 2;
      continue;
    }
    const f: Field | undefined = cur?.find((x) => x.key === p);
    i++;
    if (!f) { out.push(/^\d+$/.test(p) ? `#${Number(p) + 1}` : humanize(p)); cur = null; continue; }
    let label = f.label;
    let showParent = true;
    cur = null;
    if (f.kind === "list") {
      if (/^\d+$/.test(parts[i] ?? "")) { label += ` #${Number(parts[i]) + 1}`; i++; cur = f.item; }
    } else if (f.kind === "object") cur = f.fields;
    else if (f.kind === "cta") { cur = ctaFields(f.label, f.optional); showParent = false; }
    else if (f.kind === "image") cur = imageFields(f.people);
    else if (f.kind === "localized" && (parts[i] === "en" || parts[i] === "fr")) { label += parts[i] === "en" ? " (English)" : " (French)"; i++; }
    if (showParent) out.push(label);
  }
  return out.join(": ");
}
