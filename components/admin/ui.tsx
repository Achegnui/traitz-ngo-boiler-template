import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Class overrides that give the shadcn Input, Textarea and Select trigger the admin's look. */
export const fieldCls =
  "h-auto bg-white py-2 text-[15px] text-slate-900 shadow-sm placeholder:text-slate-500 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-300 disabled:bg-slate-100 disabled:opacity-100 aria-invalid:border-red-500 md:text-[15px]";
const btn = "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary = `${btn} bg-amber-400 text-slate-900 hover:bg-amber-300`;
export const btnSecondary = `${btn} border border-slate-300 bg-white text-slate-800 hover:bg-slate-50`;
export const btnDanger = `${btn} border border-red-300 bg-white text-red-700 hover:bg-red-50`;
export const btnSmall = "rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40";

/** Table look: a rounded card around a shadcn Table, slate header, hairline rows. */
export const tableWrap = "overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200";
export const thCls = "h-auto px-4 py-3 text-xs font-bold tracking-wide text-slate-500 uppercase";
export const rowThCls = "h-auto px-4 py-3 text-sm font-semibold whitespace-normal text-slate-900";
export const tdCls = "px-4 py-3 whitespace-normal";
export const trCls = "border-slate-100 hover:bg-transparent";

const tones = {
  error: "border-red-300 bg-red-50 text-red-900",
  success: "border-emerald-300 bg-emerald-50 text-emerald-900",
  info: "border-sky-300 bg-sky-50 text-sky-900",
  warn: "border-amber-300 bg-amber-50 text-amber-900",
};
export function Alert({ tone = "info", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

export function StatusBadge({ status }: { status?: string }) {
  const pub = status === "published";
  return (
    <Badge variant="secondary" className={cn("rounded-full border-0 px-2.5 text-xs font-semibold", pub ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700")}>
      {pub ? "Published" : "Draft"}
    </Badge>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p className="p-6 text-sm text-slate-500" role="status">{label}</p>;
}

export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
