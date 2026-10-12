"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { backend } from "@/lib/admin/backend";
import { slugify } from "@/lib/admin/fields";
import { explainError, labelFor, prepare, revalidateSite, uniqueId, type Mode } from "@/lib/admin/save";
import type { CollectionConfig } from "@/lib/admin/specs";
import { can, type Raw } from "@/lib/admin/types";
import { useStaff } from "./AuthProvider";
import { useConfirm } from "./ConfirmDialog";
import { ErrorSummary, FieldList } from "./FieldEditor";
import { Alert, btnDanger, btnPrimary, btnSecondary, Loading, PageTitle, StatusBadge } from "./ui";
import { useRefs } from "./useRefs";

export function CollectionForm({ cfg, id }: { cfg: CollectionConfig; id: string }) {
  const { record } = useStaff();
  const router = useRouter();
  const refs = useRefs();
  // After creating, the screen keeps the same instance (and its success message) and just learns its new id.
  const [docId, setDocId] = useState(id);
  const isNew = docId === "new";
  const [value, setValue] = useState<Raw | null>(null);
  const [saved, setSaved] = useState<Raw | null>(null); // what is stored right now
  const [missing, setMissing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const slugTouched = useRef(false);
  const summary = useRef<HTMLDivElement>(null);
  const editor = can.publish(record.role);
  const confirm = useConfirm();

  useEffect(() => {
    let live = true;
    (async () => {
      if (id === "new") { setValue(cfg.blank()); return; }
      try {
        const d = await backend.get(cfg.key, id);
        if (!live) return;
        if (!d) setMissing(true); else { const { id: _i, ...rest } = d; setValue(rest); setSaved(rest); slugTouched.current = true; }
      } catch (e) { if (live) { setMsg({ tone: "error", text: explainError(e) }); setMissing(true); } }
    })();
    return () => { live = false; };
  }, [cfg, id]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (missing) return <Alert tone="error">{msg?.text ?? `That ${cfg.singular} was not found.`} <Link href={`/admin/${cfg.key}`} className="underline">Back to the list</Link></Alert>;
  if (!value) return <Loading />;

  const readOnly = !editor && saved?.status === "published";
  const status = (saved?.status as string) ?? "draft";

  function change(next: Raw) {
    if (isNew && cfg.slug === "field" && !slugTouched.current) {
      if (next.slug !== value!.slug) slugTouched.current = true;
      else next = { ...next, slug: slugify(String(next.title?.en ?? "")) };
    }
    setValue(next); setDirty(true); setMsg(null);
  }

  async function save(mode: Mode) {
    const { data, errors: errs } = prepare(value!, { fields: cfg.fields, schema: cfg.schema, mode, titleKey: cfg.titleKey, slug: cfg.slug === "field" });
    setErrors(errs);
    if (Object.keys(errs).length) {
      setMsg({ tone: "error", text: mode === "published" ? "Not published yet: some fields need attention." : "Not saved: some fields need attention." });
      setTimeout(() => summary.current?.focus(), 0);
      return;
    }
    setBusy(true); setMsg(null);
    try {
      let target = docId;
      if (isNew) {
        if (cfg.slug === "hidden") data.slug = slugify(String(data[cfg.titleKey] ?? ""));
        target = cfg.slug === "none" ? await uniqueId(cfg.key, String(cfg.titleKey === "name" ? data.name : data.title?.en)) : String(data.slug);
        if (cfg.slug !== "none" && !target) throw new Error("Add a title so an address can be made.");
        data.createdAt = data.updatedAt;
        await backend.create(cfg.key, target, data);
      } else {
        await backend.update(cfg.key, target, data);
      }
      await revalidateSite();
      setSaved(data); setValue(data); setDirty(false);
      const view = mode === "published" && cfg.publicPath?.(data);
      toast.success(mode === "published" ? "Published. The website shows it now." : "Saved as a draft. It is not on the website.", view ? { action: { label: "View it", onClick: () => window.open(`/en${view}`, "_blank", "noopener,noreferrer") } } : undefined);
      if (isNew) { setDocId(target); window.history.replaceState(null, "", `/admin/${cfg.key}/${target}`); }
    } catch (e) {
      setMsg({ tone: "error", text: explainError(e) });
    } finally { setBusy(false); }
  }

  async function remove() {
    if (!(await confirm({ title: `Delete this ${cfg.singular}?`, message: "It will be removed from the website straight away. This cannot be undone." }))) return;
    setBusy(true);
    try { await backend.remove(cfg.key, docId); await revalidateSite(); setDirty(false); router.replace(`/admin/${cfg.key}`); }
    catch (e) { setMsg({ tone: "error", text: explainError(e) }); setBusy(false); }
  }

  const items = Object.entries(errors).map(([key, m]) => ({ key, text: `${labelFor(key, cfg.fields)}: ${m}` }));

  return (
    <>
      <PageTitle title={isNew ? `New ${cfg.singular}` : `Edit ${cfg.singular}`}>
        {!isNew && <StatusBadge status={status} />}
        <Link href={`/admin/${cfg.key}`} className={btnSecondary}>Back to {cfg.label.toLowerCase()}</Link>
      </PageTitle>
      {readOnly && <div className="mb-4"><Alert tone="warn">This {cfg.singular} is published. Contributors cannot change published items. Ask an editor to make changes.</Alert></div>}
      {!editor && !readOnly && <div className="mb-4"><Alert tone="info">You can save drafts. An editor will review and publish them.</Alert></div>}
      {msg && <div className="mb-4"><Alert tone={msg.tone}>{msg.text}</Alert></div>}
      <ErrorSummary items={items} innerRef={summary} />
      <form onSubmit={(e) => e.preventDefault()} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6" noValidate>
        <FieldList fields={cfg.fields} value={value} onChange={change} path="" ctx={{ errors, refs, disabled: busy || readOnly }} />
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
          {!readOnly && (editor ? (
            status === "published" ? (
              <>
                <button type="button" className={btnPrimary} disabled={busy} onClick={() => save("published")}>Save changes</button>
                <button type="button" className={btnSecondary} disabled={busy} onClick={() => save("draft")}>Unpublish (back to draft)</button>
              </>
            ) : (
              <>
                <button type="button" className={btnPrimary} disabled={busy} onClick={() => save("published")}>Publish</button>
                <button type="button" className={btnSecondary} disabled={busy} onClick={() => save("draft")}>Save draft</button>
              </>
            )
          ) : (
            <button type="button" className={btnPrimary} disabled={busy} onClick={() => save("draft")}>Save draft</button>
          ))}
          {busy && <span className="text-sm text-slate-500" role="status">Saving…</span>}
          {!isNew && can.remove(record.role) && <button type="button" className={`${btnDanger} ml-auto`} disabled={busy} onClick={remove}>Delete</button>}
        </div>
      </form>
    </>
  );
}
