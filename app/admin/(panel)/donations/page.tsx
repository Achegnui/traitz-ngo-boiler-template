"use client";
import { useEffect, useMemo, useState } from "react";
import { useStaff } from "@/components/admin/AuthProvider";
import { Alert, btnSmall, Loading, PageTitle, tableWrap, tdCls, thCls, trCls } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backend } from "@/lib/admin/backend";
import {
  describeFailure, filterDonations, FILTERS, formatAmount, formatWhen, isStalePending, needsReview, programmeLabel, sortNewestFirst, statusOf, summarize, titleOf,
  type DonationFilter, type DonationStatus,
} from "@/lib/admin/donations";
import { explainError } from "@/lib/admin/save";
import { can, type Raw } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const BADGE: Record<DonationStatus, { label: string; cls: string }> = {
  completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-800" },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800" },
  failed: { label: "Failed", cls: "bg-red-100 text-red-800" },
};
const card = "rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200";
const cardLabel = "text-xs font-bold tracking-wide text-slate-500 uppercase";

export default function Donations() {
  const { record } = useStaff();
  const [docs, setDocs] = useState<Raw[] | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<DonationFilter>("all");

  useEffect(() => {
    Promise.all([backend.list("donations"), backend.list("programmes").catch(() => [] as Raw[])])
      .then(([donations, programmes]) => {
        setTitles(Object.fromEntries(programmes.map((p) => [String(p.id), titleOf(p)])));
        setDocs(sortNewestFirst(donations));
      })
      .catch((e) => { setError(explainError(e)); setDocs([]); });
  }, []);

  const sum = useMemo(() => summarize(docs ?? []), [docs]);
  const shown = useMemo(() => filterDonations(docs ?? [], filter), [docs, filter]);
  const counts: Record<DonationFilter, number> = { all: sum.total, completed: sum.completed, pending: sum.pending, failed: sum.failed };

  if (!can.viewInbox(record.role)) return <Alert tone="warn">Only editors and administrators can see donations.</Alert>;

  return (
    <>
      <PageTitle title="Donations" />
      <p className="mb-4 text-sm text-slate-600">
        Read-only. A donation is saved when a donor starts a Mobile Money payment and updates by itself when Fapshi confirms it.
        &ldquo;Monthly&rdquo; records the donor&apos;s intention only: every gift is a separate payment and nothing is charged automatically.
      </p>
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      {docs === null ? <Loading /> : docs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No donations yet.</div>
      ) : (
        <>
          <dl className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className={card}><dt className={cardLabel}>Received</dt><dd className="mt-1 text-2xl font-bold text-slate-900">{sum.completedTotal.toLocaleString("en")} XAF</dd><dd className="text-sm text-slate-600">{sum.completed} completed</dd></div>
            <div className={card}><dt className={cardLabel}>Pending</dt><dd className="mt-1 text-2xl font-bold text-slate-900">{sum.pending}</dd><dd className="text-sm text-slate-600">waiting for the donor to pay</dd></div>
            <div className={card}><dt className={cardLabel}>Failed</dt><dd className="mt-1 text-2xl font-bold text-slate-900">{sum.failed}</dd><dd className="text-sm text-slate-600">declined, expired or not started</dd></div>
          </dl>
          {sum.review > 0 && (
            <div className="mb-4"><Alert tone="warn">{sum.review === 1 ? "1 donation needs" : `${sum.review} donations need`} review: Fapshi reported a different amount than the donor pledged, so money may have arrived. Check the Fapshi dashboard before treating {sum.review === 1 ? "it" : "them"} as failed.</Alert></div>
          )}
          <div role="group" aria-label="Filter by status" className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={cn(btnSmall, filter === f.id && "border-slate-900 bg-slate-900 text-white hover:bg-slate-800")}>
                {f.label} <span className="opacity-70">({counts[f.id]})</span>
              </button>
            ))}
          </div>
          {shown.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No {filter} donations.</div>
          ) : (
            <div className={tableWrap}>
              <Table>
                <TableCaption className="sr-only">Donations</TableCaption>
                <TableHeader className="bg-slate-50 [&_tr]:border-b-0">
                  <TableRow className="border-0 hover:bg-transparent">{["Date (UTC)", "Donor", "Amount", "Type", "Programme", "Status"].map((h) => <TableHead key={h} scope="col" className={thCls}>{h}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                  {shown.map((d) => {
                    const status = statusOf(d);
                    const why = status === "failed" ? describeFailure(d.failureReason) : null;
                    return (
                      <TableRow key={d.id} className={trCls}>
                        <TableCell className={cn(tdCls, "whitespace-nowrap")}>{formatWhen(d.createdAt)}</TableCell>
                        <TableCell className={tdCls}>{d.donorName || "Anonymous"}{d.donorEmail ? <span className="block text-xs text-slate-500">{d.donorEmail}</span> : null}</TableCell>
                        <TableCell className={`${tdCls} font-semibold whitespace-nowrap`}>{formatAmount(d)}</TableCell>
                        <TableCell className={tdCls}>{d.frequency === "monthly" ? "Monthly" : "One time"}</TableCell>
                        <TableCell className={tdCls}>{programmeLabel(d, titles)}</TableCell>
                        <TableCell className={tdCls}>
                          <Badge variant="secondary" className={cn("rounded-full border-0 px-2.5 text-xs font-semibold", BADGE[status].cls)}>{BADGE[status].label}</Badge>
                          {needsReview(d) && <span className="mt-1 block text-xs font-semibold text-red-700">Needs review</span>}
                          {why && <span className="mt-1 block max-w-[260px] text-xs text-slate-500">{why}</span>}
                          {isStalePending(d) && <span className="mt-1 block text-xs text-slate-500">Probably abandoned (over a day old)</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </>
  );
}
