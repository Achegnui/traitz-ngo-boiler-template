"use client";
import { useRef, useState, type ReactNode } from "react";
import { backend } from "@/lib/admin/backend";
import { ArtSvg } from "@/lib/art";
import { ctaFields, imageFields, type Field } from "@/lib/admin/fields";
import type { Raw } from "@/lib/admin/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AdminSelect } from "./AdminSelect";
import { btnSecondary, btnSmall, fieldCls } from "./ui";

export type RefOption = { id: string; label: string };
export type EditorCtx = { errors: Record<string, string>; refs: Record<string, RefOption[]>; disabled?: boolean };

export const idOf = (path: string) => "f-" + path.replace(/[^a-zA-Z0-9]+/g, "-");
const join = (a: string, b: string) => (a ? `${a}.${b}` : b);
const textOf = (v: unknown): string => (typeof v === "string" ? v : v && typeof v === "object" && typeof (v as Raw).en === "string" ? (v as Raw).en : "");

/** Renders a list of fields. `path` ("blocks.2.headline") is how validation messages find their field. */
export function FieldList({ fields, value, onChange, path, ctx }: {
  fields: Field[]; value: Raw | undefined; onChange: (v: Raw) => void; path: string; ctx: EditorCtx;
}) {
  const v = value ?? {};
  const patch = (p: Raw) => onChange({ ...v, ...p });
  return (
    <div className="space-y-5">
      {fields.map((f) => <FieldRow key={f.key} f={f} value={v[f.key]} path={join(path, f.key)} ctx={ctx} onChange={(nv) => patch({ [f.key]: nv })} onPatch={patch} />)}
    </div>
  );
}

function Wrap({ f, path, ctx, children, legend }: { f: Field; path: string; ctx: EditorCtx; children: ReactNode; legend?: boolean }) {
  const err = ctx.errors[path];
  const label = (
    <>
      {f.label}
      {!f.optional && <span aria-hidden="true" className="text-red-600"> *</span>}
    </>
  );
  const cls = "mb-1 block text-sm font-semibold text-slate-800";
  return (
    <div>
      {legend ? <p className={cls}>{label}</p> : <Label htmlFor={idOf(path)} className={cn(cls, "leading-5")}>{label}</Label>}
      {f.hint && <p id={idOf(path) + "-hint"} className="mb-1.5 text-xs text-slate-500">{f.hint}</p>}
      {children}
      {err && <p id={idOf(path) + "-err"} className="mt-1 text-xs font-medium text-red-700">{err}</p>}
    </div>
  );
}

function FieldRow({ f, value, onChange, onPatch, path, ctx }: {
  f: Field; value: unknown; onChange: (v: unknown) => void; onPatch: (p: Raw) => void; path: string; ctx: EditorCtx;
}) {
  const id = idOf(path);
  const err = ctx.errors[path];
  const common = {
    id, disabled: ctx.disabled, "aria-invalid": err ? true : undefined,
    "aria-describedby": [f.hint ? id + "-hint" : "", err ? id + "-err" : ""].filter(Boolean).join(" ") || undefined,
  } as const;

  switch (f.kind) {
    case "text":
      return <Wrap f={f} path={path} ctx={ctx}><Input {...common} type={f.input ?? "text"} placeholder={f.placeholder} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={fieldCls} /></Wrap>;
    case "textarea":
      return <Wrap f={f} path={path} ctx={ctx}><Textarea {...common} rows={f.rows ?? 4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={cn(fieldCls, "field-sizing-fixed")} /></Wrap>;
    case "number":
      return <Wrap f={f} path={path} ctx={ctx}><Input {...common} type="number" min={f.min} step={f.step} value={typeof value === "number" ? value : ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} className={fieldCls} /></Wrap>;
    case "date":
      return <Wrap f={f} path={path} ctx={ctx}><Input {...common} type="date" value={String(value ?? "").slice(0, 10)} onChange={(e) => onChange(e.target.value)} className={fieldCls} /></Wrap>;
    case "datetime":
      return <Wrap f={f} path={path} ctx={ctx}><Input {...common} type="datetime-local" value={String(value ?? "").slice(0, 16)} onChange={(e) => onChange(e.target.value)} className={fieldCls} /></Wrap>;
    case "checkbox":
      return (
        <div>
          <label className="flex items-start gap-2 text-sm text-slate-800">
            <input {...common} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-400" />
            <span><span className="font-semibold">{f.label}</span>{f.hint && <span className="block text-xs text-slate-500">{f.hint}</span>}</span>
          </label>
          {err && <p id={id + "-err"} className="mt-1 text-xs font-medium text-red-700">{err}</p>}
        </div>
      );
    case "select":
      return (
        <Wrap f={f} path={path} ctx={ctx}>
          <AdminSelect {...common} value={(value as string) ?? ""} onChange={onChange} noneLabel={f.optional ? "None" : undefined} placeholder="Choose…" options={f.options} />
        </Wrap>
      );
    case "localized": {
      const v = (value as Raw) ?? { en: "" };
      const Tag = f.multiline ? Textarea : Input;
      const tagCls = cn(fieldCls, f.multiline && "field-sizing-fixed");
      const set = (lang: "en" | "fr", t: string) => onChange({ ...v, [lang]: t });
      const eErr = ctx.errors[path + ".en"] ?? err;
      return (
        <fieldset aria-describedby={f.hint ? id + "-hint" : undefined}>
          <legend className="mb-1 text-sm font-semibold text-slate-800">{f.label}{!f.optional && <span aria-hidden="true" className="text-red-600"> *</span>}</legend>
          {f.hint && <p id={id + "-hint"} className="mb-1.5 text-xs text-slate-500">{f.hint}</p>}
          <Tabs defaultValue="en" className="gap-2">
            <TabsList className="h-8 bg-slate-100">
              <TabsTrigger value="en" className="px-3 text-xs">English</TabsTrigger>
              <TabsTrigger value="fr" className="px-3 text-xs">Français</TabsTrigger>
            </TabsList>
            <TabsContent value="en" forceMount className="data-[state=inactive]:hidden">
              <Label htmlFor={id + "-en"} className="mb-0.5 block text-xs leading-4 font-medium text-slate-600">English</Label>
              <Tag id={id + "-en"} rows={f.rows ?? 4} disabled={ctx.disabled} aria-invalid={eErr ? true : undefined} aria-describedby={eErr ? id + "-err" : undefined}
                value={v.en ?? ""} onChange={(e) => set("en", e.target.value)} className={tagCls} />
            </TabsContent>
            <TabsContent value="fr" forceMount className="data-[state=inactive]:hidden">
              <Label htmlFor={id + "-fr"} className="mb-0.5 block text-xs leading-4 font-medium text-slate-600">Français <span className="font-normal text-slate-500">(optional, English is shown if empty)</span></Label>
              <Tag id={id + "-fr"} rows={f.rows ?? 4} disabled={ctx.disabled} value={v.fr ?? ""} onChange={(e) => set("fr", e.target.value)} className={tagCls} />
            </TabsContent>
          </Tabs>
          {eErr && <p id={id + "-err"} className="mt-1 text-xs font-medium text-red-700">{eErr}</p>}
        </fieldset>
      );
    }
    case "cta": {
      const sub = ctaFields(f.label, f.optional);
      return (
        <fieldset className="rounded-md border border-slate-200 p-3">
          <legend className="px-1 text-sm font-semibold text-slate-800">{f.label}{f.optional && <span className="font-normal text-slate-500"> (optional)</span>}</legend>
          <FieldList fields={sub} value={value as Raw} onChange={onChange} path={path} ctx={ctx} />
        </fieldset>
      );
    }
    case "image": return <ImageField f={f} value={value as Raw} onChange={onChange} path={path} ctx={ctx} people={f.people} />;
    case "file": return <FileField f={f} value={value as string} onPatch={onPatch} path={path} ctx={ctx} />;
    case "list": {
      const items: Raw[] = Array.isArray(value) ? (value as Raw[]) : [];
      const move = (i: number, d: number) => { const n = [...items]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
      return (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-800">{f.label}</legend>
          {f.hint && <p className="mb-2 text-xs text-slate-500">{f.hint}</p>}
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">{(f.itemTitle && textOf(it[f.itemTitle])) || `Item ${i + 1}`}</span>
                  <span className="flex gap-1">
                    <button type="button" className={btnSmall} disabled={ctx.disabled || i === 0} onClick={() => move(i, -1)} aria-label={`Move item ${i + 1} up`}>Up</button>
                    <button type="button" className={btnSmall} disabled={ctx.disabled || i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Move item ${i + 1} down`}>Down</button>
                    <button type="button" className={btnSmall} disabled={ctx.disabled} onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove item ${i + 1}`}>Remove</button>
                  </span>
                </div>
                <FieldList fields={f.item} value={it} onChange={(nv) => onChange(items.map((x, j) => (j === i ? nv : x)))} path={`${path}.${i}`} ctx={ctx} />
              </div>
            ))}
          </div>
          {ctx.errors[path] && <p className="mt-1 text-xs font-medium text-red-700">{ctx.errors[path]}</p>}
          <button type="button" className={`${btnSecondary} mt-3`} disabled={ctx.disabled} onClick={() => onChange([...items, f.blank()])}>{f.addLabel}</button>
        </fieldset>
      );
    }
    case "object":
      return value ? (
        <fieldset className="rounded-md border border-slate-200 p-3">
          <legend className="px-1 text-sm font-semibold text-slate-800">{f.label}</legend>
          <FieldList fields={f.fields} value={value as Raw} onChange={onChange} path={path} ctx={ctx} />
          {f.optional && <button type="button" className={`${btnSmall} mt-3`} disabled={ctx.disabled} onClick={() => onChange(undefined)}>Remove {f.label.toLowerCase()}</button>}
        </fieldset>
      ) : (
        <div><button type="button" className={btnSecondary} disabled={ctx.disabled} onClick={() => onChange(f.blank())}>{f.addLabel}</button></div>
      );
    case "ref": {
      const opts = ctx.refs[f.collection] ?? [];
      const missing = Boolean(value) && !opts.some((o) => o.id === value);
      return (
        <Wrap f={f} path={path} ctx={ctx}>
          <AdminSelect {...common} value={(value as string) ?? ""} onChange={onChange} placeholder="Choose…"
            options={[...(missing ? [{ value: value as string, label: `${String(value)} (not found)` }] : []), ...opts.map((o) => ({ value: o.id, label: o.label }))]} />
        </Wrap>
      );
    }
    case "refList": {
      const opts = ctx.refs[f.collection] ?? [];
      const chosen: string[] = Array.isArray(value) ? (value as string[]) : [];
      const left = opts.filter((o) => !chosen.includes(o.id));
      const label = (id: string) => opts.find((o) => o.id === id)?.label ?? `${id} (not found)`;
      const move = (i: number, d: number) => { const n = [...chosen]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
      return (
        <Wrap f={f} path={path} ctx={ctx} legend>
          <ul className="mb-2 space-y-1">
            {chosen.map((id, i) => (
              <li key={id} className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm">
                <span>{label(id)}</span>
                <span className="flex gap-1">
                  <button type="button" className={btnSmall} disabled={ctx.disabled || i === 0} onClick={() => move(i, -1)} aria-label={`Move ${label(id)} up`}>Up</button>
                  <button type="button" className={btnSmall} disabled={ctx.disabled || i === chosen.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${label(id)} down`}>Down</button>
                  <button type="button" className={btnSmall} disabled={ctx.disabled} onClick={() => onChange(chosen.filter((x) => x !== id))} aria-label={`Remove ${label(id)}`}>Remove</button>
                </span>
              </li>
            ))}
          </ul>
          <AdminSelect {...common} aria-label={`Add to ${f.label}`} value="" disabled={ctx.disabled || left.length === 0} onChange={(v) => v && onChange([...chosen, v])}
            placeholder={left.length ? "Add…" : "Everything is already added"} options={left.map((o) => ({ value: o.id, label: o.label }))} />
        </Wrap>
      );
    }
  }
}

function useUploader(kind: "image" | "file") {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = async (file: File | undefined, done: (r: { url: string; bytes: number }) => void) => {
    if (!file) return;
    setBusy(true); setError("");
    try { done(await backend.upload(file, kind)); }
    catch (e) { setError(e instanceof Error ? e.message : "The upload failed."); }
    finally { setBusy(false); }
  };
  return { busy, error, run };
}

function ImageField({ f, value, onChange, path, ctx, people }: { f: Field; value: Raw | undefined; onChange: (v: unknown) => void; path: string; ctx: EditorCtx; people?: boolean }) {
  const v: Raw = value ?? { alt: { en: "" } };
  const { busy, error, run } = useUploader("image");
  const input = useRef<HTMLInputElement>(null);
  const sub = imageFields(people);
  return (
    <fieldset className="rounded-md border border-slate-200 p-3">
      <legend className="px-1 text-sm font-semibold text-slate-800">{f.label}{f.optional && <span className="font-normal text-slate-500"> (optional)</span>}</legend>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {v.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.url} alt="" className="h-24 w-36 rounded border border-slate-200 object-cover" />
        ) : (
          <div className={cn("relative h-24 w-36 overflow-hidden rounded border border-dashed border-slate-300 text-center text-xs leading-[6rem] text-slate-500", !v.art && v.gradient && "text-white")} style={!v.art && v.gradient ? { background: `linear-gradient(135deg, ${v.gradient[0]}, ${v.gradient[1]})` } : undefined}>
            {v.art ? <ArtSvg art={v.art} className="absolute inset-0 h-full w-full" /> : v.gradient ? "Placeholder" : "No image yet"}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" tabIndex={-1} disabled={ctx.disabled} aria-label={`${f.label}: choose a file`}
            onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; run(file, (r) => onChange({ ...v, url: r.url })); }} />
          <button type="button" className={btnSecondary} disabled={busy || ctx.disabled} onClick={() => input.current?.click()}>{busy ? "Uploading…" : v.url ? "Replace image" : "Upload image"}</button>
          {v.url && <button type="button" className={btnSmall} disabled={ctx.disabled} onClick={() => { const { url: _u, ...rest } = v; onChange(rest); }}>Remove image</button>}
        </div>
      </div>
      {error && <p role="alert" className="mb-2 text-xs font-medium text-red-700">{error}</p>}
      <FieldList fields={sub} value={v} onChange={onChange} path={path} ctx={ctx} />
    </fieldset>
  );
}

function FileField({ f, value, onPatch, path, ctx }: { f: Extract<Field, { kind: "file" }>; value: string | undefined; onPatch: (p: Raw) => void; path: string; ctx: EditorCtx }) {
  const image = f.media === "image";
  const { busy, error, run } = useUploader(image ? "image" : "file");
  const input = useRef<HTMLInputElement>(null);
  const id = idOf(path);
  return (
    <Wrap f={f} path={path} ctx={ctx}>
      <Input id={id} type="url" disabled={ctx.disabled} value={value ?? ""} aria-invalid={ctx.errors[path] ? true : undefined} aria-describedby={ctx.errors[path] ? id + "-err" : undefined}
        onChange={(e) => onPatch({ [f.key]: e.target.value })} className={fieldCls} placeholder="https://…" />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input ref={input} type="file" accept={image ? "image/jpeg,image/png,image/webp,image/avif,image/gif" : "application/pdf"} className="sr-only" tabIndex={-1} disabled={ctx.disabled} aria-label={`${f.label}: choose a ${image ? "file" : "PDF"}`}
          onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; run(file, (r) => onPatch({ [f.key]: r.url, ...(f.sizeKey ? { [f.sizeKey]: r.bytes } : {}) })); }} />
        <button type="button" className={btnSecondary} disabled={busy || ctx.disabled} onClick={() => input.current?.click()}>{busy ? "Uploading…" : `${value ? "Replace" : "Upload"} ${image ? "image" : "PDF"}`}</button>
        {error && <span role="alert" className="text-xs font-medium text-red-700">{error}</span>}
      </div>
    </Wrap>
  );
}

/** Lists what needs fixing; each item jumps to its field. */
export function ErrorSummary({ items, innerRef }: { items: { key: string; text: string }[]; innerRef: React.RefObject<HTMLDivElement | null> }) {
  if (!items.length) return null;
  return (
    <div ref={innerRef} tabIndex={-1} role="alert" className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900">
      <p className="font-semibold">Please fix {items.length === 1 ? "this" : `these ${items.length} things`} before publishing:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.slice(0, 12).map((i) => (
          <li key={i.key}>
            <a href={`#${idOf(i.key)}`} className="underline" onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(idOf(i.key)) ?? document.getElementById(idOf(i.key) + "-en");
              const panel = el?.closest<HTMLElement>('[role="tabpanel"]');
              if (panel?.dataset.state === "inactive") document.querySelector<HTMLElement>(`[aria-controls="${panel.id}"]`)?.focus();
              requestAnimationFrame(() => { el?.scrollIntoView({ block: "center" }); (el as HTMLElement | null)?.focus(); });
            }}>{i.text}</a>
          </li>
        ))}
        {items.length > 12 && <li>…and {items.length - 12} more</li>}
      </ul>
    </div>
  );
}
