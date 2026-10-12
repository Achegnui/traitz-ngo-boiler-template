"use client";
import { useCallback, useEffect, useState } from "react";
import { useStaff } from "@/components/admin/AuthProvider";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Alert, btnDanger, btnSecondary, Loading, PageTitle } from "@/components/admin/ui";
import { backend } from "@/lib/admin/backend";
import { explainError } from "@/lib/admin/save";
import { can, type Raw } from "@/lib/admin/types";

export default function Submissions() {
  const { record } = useStaff();
  const confirm = useConfirm();
  const [docs, setDocs] = useState<Raw[] | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setDocs((await backend.list("submissions")).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))); }
    catch (e) { setError(explainError(e)); setDocs([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (!can.viewInbox(record.role)) return <Alert tone="warn">Only editors and administrators can read messages.</Alert>;

  async function toggle(d: Raw) {
    const { id, ...rest } = d;
    try { await backend.update("submissions", id, { ...rest, handled: !d.handled }); await load(); } catch (e) { setError(explainError(e)); }
  }
  async function remove(d: Raw) {
    if (!(await confirm({ title: `Delete the message from ${d.name || "this person"}?`, message: "This cannot be undone." }))) return;
    try { await backend.remove("submissions", d.id); await load(); } catch (e) { setError(explainError(e)); }
  }

  return (
    <>
      <PageTitle title="Submissions" />
      <p className="mb-4 text-sm text-slate-600">Messages from the contact, volunteer and partnership forms.</p>
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      {docs === null ? <Loading /> : docs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No messages yet.</div>
      ) : (
        <ul className="space-y-3">
          {docs.map((d) => (
            <li key={d.id} className={`rounded-lg bg-white p-4 shadow-sm ring-1 ${d.handled ? "ring-slate-200" : "ring-amber-300"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{d.name} <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{d.type}</span> {!d.handled && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">New</span>}</p>
                  <p className="text-sm text-slate-600"><a className="underline" href={`mailto:${d.email}`}>{d.email}</a>{d.phone ? ` · ${d.phone}` : ""} · {String(d.createdAt ?? "").slice(0, 10)}</p>
                </div>
                <span className="flex gap-2">
                  <button type="button" className={btnSecondary} onClick={() => toggle(d)}>{d.handled ? "Mark as new" : "Mark as handled"}</button>
                  <button type="button" className={btnDanger} onClick={() => remove(d)}>Delete</button>
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-800">{d.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
