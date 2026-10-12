"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { backend } from "@/lib/admin/backend";
import { prune } from "@/lib/admin/fields";
import { explainError, labelFor, pageExtraErrors, prepare, revalidateSite, type Mode } from "@/lib/admin/save";
import { BLOCKS, PAGE_FIELDS, type BlockType } from "@/lib/admin/specs";
import { can, type Raw } from "@/lib/admin/types";
import { pageSchema } from "@/lib/schemas";
import { useStaff } from "./AuthProvider";
import { useConfirm } from "./ConfirmDialog";
import { BlockEditor } from "./BlockEditor";
import { ErrorSummary, FieldList } from "./FieldEditor";
import { Alert, btnDanger, btnPrimary, btnSecondary, Loading, PageTitle, StatusBadge } from "./ui";
import { useRefs } from "./useRefs";

export function PageEditor({ slug }: { slug: string }) {
  const { record } = useStaff();
  const refs = useRefs();
  const [value, setValue] = useState<Raw | null>(null);
  const [saved, setSaved] = useState<Raw | null>(null);
  const [missing, setMissing] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const summary = useRef<HTMLDivElement>(null);
  const editor = can.publish(record.role);
  const confirm = useConfirm();

  useEffect(() => {
    let live = true;
    backend.get("pages", slug).then((d) => {
      if (!live) return;
      if (!d) return setMissing(`There is no page called “${slug}”.`);
      const { id: _i, ...rest } = d;
      setValue(rest); setSaved(rest);
    }).catch((e) => live && setMissing(explainError(e)));
    return () => { live = false; };
  }, [slug]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (missing) return <Alert tone="error">{missing} <Link className="underline" href="/admin/pages">Back to pages</Link></Alert>;
  if (!value) return <Loading />;

  const status = (saved?.status as string) ?? "draft";
  const readOnly = !editor && status === "published";
  const blocks: Raw[] = Array.isArray(value.blocks) ? value.blocks : [];
  const live = slug === "home" ? "/en" : `/en/${slug}`;

  async function save(mode: Mode) {
    const tidy: Raw = { ...value!, blocks: blocks.map((b) => ({ ...prune(b, BLOCKS[b.type as BlockType]?.fields ?? []), id: b.id, type: b.type })) };
    const { data, errors: errs } = prepare(tidy, { fields: PAGE_FIELDS, schema: pageSchema, mode, titleKey: "title", extra: pageExtraErrors });
    setErrors(errs);
    if (Object.keys(errs).length) {
      setMsg({ tone: "error", text: mode === "published" ? "Not published yet: some sections need attention." : "Not saved: some fields need attention." });
      setTimeout(() => summary.current?.focus(), 0);
      return;
    }
    setBusy(true); setMsg(null);
    try {
      await backend.update("pages", slug, data);
      await revalidateSite();
      setSaved(data); setValue(data); setDirty(false);
      toast.success(mode === "published" ? "Published. The website shows it now." : "Saved as a draft. The website is unchanged.", mode === "published" ? { action: { label: "View it", onClick: () => window.open(live, "_blank", "noopener,noreferrer") } } : undefined);
    } catch (e) { setMsg({ tone: "error", text: explainError(e) }); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!(await confirm({ title: "Delete this page?", message: "It will disappear from the website straight away. This cannot be undone." }))) return;
    try { await backend.remove("pages", slug); await revalidateSite(); setDirty(false); window.location.assign("/admin/pages"); }
    catch (e) { setMsg({ tone: "error", text: explainError(e) }); }
  }

  const items = Object.entries(errors).map(([key, m]) => ({ key, text: `${labelFor(key, PAGE_FIELDS, blocks)}: ${m}` }));
  const ctx = { errors, refs, disabled: busy || readOnly };

  return (
    <>
      <PageTitle title={`Page: ${value.title?.en || slug}`}>
        <StatusBadge status={status} />
        {status === "published" && <a href={live} target="_blank" rel="noopener noreferrer" className={btnSecondary}>View on website</a>}
        <Link href="/admin/pages" className={btnSecondary}>Back to pages</Link>
      </PageTitle>
      {readOnly && <div className="mb-4"><Alert tone="warn">This page is published. Contributors cannot change published pages. Ask an editor.</Alert></div>}
      {!editor && !readOnly && <div className="mb-4"><Alert tone="info">You can save drafts. An editor will review and publish them.</Alert></div>}
      {msg && <div className="mb-4"><Alert tone={msg.tone}>{msg.text}</Alert></div>}
      <ErrorSummary items={items} innerRef={summary} />
      <div className="space-y-8">
        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <FieldList fields={PAGE_FIELDS} value={value} onChange={(v) => { setValue(v); setDirty(true); setMsg(null); }} path="" ctx={ctx} />
        </div>
        <BlockEditor blocks={blocks} onChange={(b) => { setValue({ ...value, blocks: b }); setDirty(true); setMsg(null); }} ctx={ctx} />
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
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
          ) : <button type="button" className={btnPrimary} disabled={busy} onClick={() => save("draft")}>Save draft</button>)}
          {busy && <span className="text-sm text-slate-500" role="status">Saving…</span>}
          {can.remove(record.role) && slug !== "home" && <button type="button" className={`${btnDanger} ml-auto`} disabled={busy} onClick={remove}>Delete page</button>}
        </div>
      </div>
    </>
  );
}
