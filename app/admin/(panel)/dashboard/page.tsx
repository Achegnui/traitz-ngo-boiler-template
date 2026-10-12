"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useStaff } from "@/components/admin/AuthProvider";
import { Alert, btnPrimary, Loading, PageTitle } from "@/components/admin/ui";
import { backend } from "@/lib/admin/backend";
import { explainError } from "@/lib/admin/save";
import { COLLECTIONS } from "@/lib/admin/specs";
import { can } from "@/lib/admin/types";

type Counts = Record<string, { published: number; draft: number }>;

export default function Dashboard() {
  const { record } = useStaff();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [inbox, setInbox] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const keys = ["pages", ...Object.keys(COLLECTIONS)];
        const rows = await Promise.all(keys.map(async (k) => { const docs = await backend.list(k); const published = docs.filter((d) => d.status === "published").length; return [k, { published, draft: docs.length - published }] as const; }));
        setCounts(Object.fromEntries(rows));
        if (can.viewInbox(record.role)) setInbox((await backend.list("submissions")).filter((s) => !s.handled).length);
      } catch (e) { setError(explainError(e)); }
    })();
  }, [record.role]);

  const cards = [{ key: "pages", label: "Pages", href: "/admin/pages" }, ...Object.values(COLLECTIONS).map((c) => ({ key: c.key, label: c.label, href: `/admin/${c.key}` }))];

  return (
    <>
      <PageTitle title="Dashboard">
        <Link href="/admin/news/new" className={btnPrimary}>Write a news post</Link>
      </PageTitle>
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      {inbox !== null && inbox > 0 && (
        <div className="mb-4"><Alert tone="info">You have <strong>{inbox}</strong> new message{inbox === 1 ? "" : "s"} in <Link href="/admin/submissions" className="underline">Submissions</Link>.</Alert></div>
      )}
      {!counts ? <Loading /> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <li key={c.key}>
              <Link href={c.href} className="block rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-amber-400">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{c.label}</h2>
                <p className="mt-2 text-3xl font-bold text-slate-900">{counts[c.key]?.published ?? 0}{" "}<span className="ml-1 text-sm font-medium text-slate-500">published</span></p>
                <p className="mt-1 text-sm text-slate-600">{counts[c.key]?.draft ?? 0} draft{counts[c.key]?.draft === 1 ? "" : "s"}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-sm text-slate-600">New here? Read the <Link href="/admin/help" className="underline">one-page guide</Link>.</p>
    </>
  );
}
