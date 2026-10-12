"use client";
import { useEffect, useState } from "react";
import { useStaff } from "@/components/admin/AuthProvider";
import { Alert, Loading, PageTitle, tableWrap, tdCls, thCls, trCls } from "@/components/admin/ui";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backend } from "@/lib/admin/backend";
import { explainError } from "@/lib/admin/save";
import { can, type Raw } from "@/lib/admin/types";

export default function Donations() {
  const { record } = useStaff();
  const [docs, setDocs] = useState<Raw[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { backend.list("donations").then((d) => setDocs(d.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))))).catch((e) => { setError(explainError(e)); setDocs([]); }); }, []);

  if (!can.viewInbox(record.role)) return <Alert tone="warn">Only editors and administrators can see donations.</Alert>;
  const fmt = (d: Raw) => `${Number(d.amount ?? 0).toLocaleString("en")} ${d.currency ?? "XAF"}`;

  return (
    <>
      <PageTitle title="Donations" />
      <p className="mb-4 text-sm text-slate-600">Read-only. Donations appear here automatically once mobile money payments are connected.</p>
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      {docs === null ? <Loading /> : docs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No donations yet.</div>
      ) : (
        <div className={tableWrap}>
          <Table>
            <TableCaption className="sr-only">Donations</TableCaption>
            <TableHeader className="bg-slate-50 [&_tr]:border-b-0">
              <TableRow className="border-0 hover:bg-transparent">{["Date", "Donor", "Amount", "Type", "Status"].map((h) => <TableHead key={h} scope="col" className={thCls}>{h}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id} className={trCls}>
                  <TableCell className={tdCls}>{String(d.createdAt ?? "").slice(0, 10)}</TableCell>
                  <TableCell className={tdCls}>{d.donorName || "Anonymous"}{d.donorEmail ? <span className="block text-xs text-slate-500">{d.donorEmail}</span> : null}</TableCell>
                  <TableCell className={`${tdCls} font-semibold`}>{fmt(d)}</TableCell>
                  <TableCell className={tdCls}>{d.frequency}</TableCell>
                  <TableCell className={tdCls}>{d.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
