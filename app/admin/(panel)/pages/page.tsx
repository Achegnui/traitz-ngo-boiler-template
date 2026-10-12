"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useStaff } from "@/components/admin/AuthProvider";
import { Alert, btnPrimary, btnSecondary, fieldCls, Loading, PageTitle, StatusBadge } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backend } from "@/lib/admin/backend";
import { slugify } from "@/lib/admin/fields";
import { explainError, revalidateSite } from "@/lib/admin/save";
import { newBlock } from "@/lib/admin/specs";
import type { Raw } from "@/lib/admin/types";

const RESERVED = ["admin", "api", "en", "fr", "og", "donate"]; // names the site itself uses (donate arrives in Phase 4)

export default function PagesList() {
  useStaff();
  const router = useRouter();
  const [docs, setDocs] = useState<Raw[] | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { backend.list("pages").then((d) => setDocs(d.sort((a, b) => (a.id === "home" ? -1 : b.id === "home" ? 1 : a.id.localeCompare(b.id))))).catch((e) => { setError(explainError(e)); setDocs([]); }); }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    const slug = slugify(name);
    if (!slug) return setError("Type a name for the page first.");
    if (RESERVED.includes(slug)) return setError(`“${slug}” is used by the website already. Choose another name.`);
    setBusy(true); setError("");
    try {
      const now = new Date().toISOString();
      await backend.create("pages", slug, { slug, status: "draft", title: { en: name.trim() }, seo: { title: { en: name.trim() }, description: { en: "" } }, blocks: [newBlock("richText")], createdAt: now, updatedAt: now });
      await revalidateSite();
      router.push(`/admin/pages/${slug}`);
    } catch (err) { setError(explainError(err)); setBusy(false); }
  }

  return (
    <>
      <PageTitle title="Pages" />
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      {docs === null ? <Loading /> : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <Link href={`/admin/pages/${d.id}`} className="font-semibold text-slate-900 hover:underline">{d.title?.en || d.id}</Link>
                <p className="text-xs text-slate-500">{d.id === "home" ? "Home page" : `/en/${d.id}`}</p>
              </div>
              <div className="flex items-center gap-3"><StatusBadge status={d.status} /><Link className={btnSecondary} href={`/admin/pages/${d.id}`}>Edit</Link></div>
            </li>
          ))}
          {docs.length === 0 && <li className="p-8 text-center text-slate-600">No pages yet.</li>}
        </ul>
      )}
      <form onSubmit={create} className="mt-8 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold">New page</h2>
        <p className="mb-3 text-sm text-slate-600">For pages like About or Get involved. It starts as a draft with one text section.</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <Label htmlFor="new-page" className="mb-1 block text-sm leading-5 font-semibold">Page name</Label>
            <Input id="new-page" value={name} onChange={(e) => setName(e.target.value)} className={fieldCls} placeholder="About us" />
            {name && <p className="mt-1 text-xs text-slate-500">Address: /en/{slugify(name)}</p>}
          </div>
          <button type="submit" className={btnPrimary} disabled={busy}>Create page</button>
        </div>
      </form>
    </>
  );
}
