"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { backend } from "@/lib/admin/backend";
import { explainError, revalidateSite } from "@/lib/admin/save";
import type { CollectionConfig } from "@/lib/admin/specs";
import { can, type Raw } from "@/lib/admin/types";
import { useStaff } from "./AuthProvider";
import { useConfirm } from "./ConfirmDialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Alert, btnDanger, btnPrimary, btnSecondary, Loading, PageTitle, rowThCls, StatusBadge, tableWrap, tdCls, thCls, trCls } from "./ui";

const titleOf = (cfg: CollectionConfig, d: Raw) => (cfg.titleKey === "name" ? d.name : d.title?.en) || "(untitled)";

export function CollectionList({ cfg }: { cfg: CollectionConfig }) {
  const { record } = useStaff();
  const [docs, setDocs] = useState<Raw[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const confirm = useConfirm();

  const load = useCallback(async () => {
    try { setDocs((await backend.list(cfg.key)).sort(cfg.sort)); setError(""); }
    catch (e) { setError(explainError(e)); setDocs([]); }
  }, [cfg]);
  useEffect(() => { setDocs(null); load(); }, [load]);

  async function remove(d: Raw) {
    if (!(await confirm({ title: `Delete “${titleOf(cfg, d)}”?`, message: "It will be removed from the website straight away. This cannot be undone." }))) return;
    try { await backend.remove(cfg.key, d.id); await revalidateSite(); toast.success(`Deleted “${titleOf(cfg, d)}”.`); await load(); }
    catch (e) { setError(explainError(e)); }
  }

  const shown = (docs ?? []).filter((d) => filter === "all" || d.status === filter);
  const counts = { published: (docs ?? []).filter((d) => d.status === "published").length, draft: (docs ?? []).filter((d) => d.status !== "published").length };

  return (
    <>
      <PageTitle title={cfg.label}>
        <Link href={`/admin/${cfg.key}/new`} className={btnPrimary}>New {cfg.singular}</Link>
      </PageTitle>
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      <div className="mb-3 flex gap-2" role="group" aria-label="Filter by status">
        {([["all", `All (${docs?.length ?? 0})`], ["published", `Published (${counts.published})`], ["draft", `Drafts (${counts.draft})`]] as const).map(([k, label]) => (
          <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${filter === k ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"}`}>{label}</button>
        ))}
      </div>
      {docs === null ? <Loading /> : shown.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          <p>{docs.length === 0 ? `No ${cfg.label.toLowerCase()} yet.` : "Nothing matches this filter."}</p>
        </div>
      ) : (
        <div className={tableWrap}>
          <Table>
            <TableCaption className="sr-only">{cfg.label}</TableCaption>
            <TableHeader className="bg-slate-50 [&_tr]:border-b-0">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead scope="col" className={thCls}>Title</TableHead>
                <TableHead scope="col" className={thCls}>Status</TableHead>
                {cfg.columns.map((c) => <TableHead key={c.header} scope="col" className={thCls}>{c.header}</TableHead>)}
                <TableHead scope="col" className={cn(thCls, "text-right")}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((d) => (
                <TableRow key={d.id} className={trCls}>
                  <TableHead scope="row" className={rowThCls}>
                    <Link href={`/admin/${cfg.key}/${d.id}`} className="hover:underline">{titleOf(cfg, d)}</Link>
                  </TableHead>
                  <TableCell className={tdCls}><StatusBadge status={d.status} /></TableCell>
                  {cfg.columns.map((c) => <TableCell key={c.header} className={cn(tdCls, "text-slate-600")}>{c.value(d)}</TableCell>)}
                  <TableCell className={cn(tdCls, "text-right")}>
                    <span className="inline-flex gap-2">
                      <Link href={`/admin/${cfg.key}/${d.id}`} className={btnSecondary}>Edit</Link>
                      {can.remove(record.role) && <button type="button" className={btnDanger} onClick={() => remove(d)} aria-label={`Delete ${titleOf(cfg, d)}`}>Delete</button>}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
