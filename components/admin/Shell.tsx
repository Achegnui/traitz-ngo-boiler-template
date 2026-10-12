"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { backend } from "@/lib/admin/backend";
import { COLLECTIONS } from "@/lib/admin/specs";
import { can, ROLE_LABEL } from "@/lib/admin/types";
import { useAuth } from "./AuthProvider";
import { btnSecondary, Loading } from "./ui";

/** Guards every panel screen: sign-in required, and the signed-in person must be on the staff list. */
export function Shell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => { if (auth.status === "out") router.replace("/admin/login"); }, [auth.status, router]);

  if (auth.status === "loading" || auth.status === "out") return <Loading label="Checking your sign-in…" />;
  if (auth.status === "unauthorized") {
    return (
      <main className="mx-auto mt-24 max-w-md rounded-lg bg-white p-8 shadow">
        <h1 className="text-xl font-bold">No access to the admin</h1>
        <p className="mt-2 text-sm text-slate-600">
          You are signed in as <strong>{auth.user.email}</strong>, but this account has not been given staff access. Ask an administrator to add you.
        </p>
        <button className={`${btnSecondary} mt-6`} onClick={() => backend.signOut()}>Sign out</button>
      </main>
    );
  }

  const { record } = auth;
  const role = record.role;
  const links: { href: string; label: string }[] = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/pages", label: "Pages" },
    ...["programmes", "stories", "news", "events", "reports", "team", "partners"].map((k) => ({ href: `/admin/${k}`, label: COLLECTIONS[k].label })),
    ...(can.viewInbox(role) ? [{ href: "/admin/submissions", label: "Submissions" }, { href: "/admin/donations", label: "Donations" }] : []),
    ...(can.manageStaff(role) ? [{ href: "/admin/users", label: "Users" }] : []),
    { href: "/admin/help", label: "Help" },
  ];

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-slate-200 bg-slate-900 text-slate-100 md:min-h-screen md:w-60 md:flex-none md:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 md:block">
          <p className="text-lg font-bold">Traitz <span className="text-amber-400">admin</span></p>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-2 pb-3 md:block md:space-y-0.5 md:px-3">
          {links.map((l) => {
            const active = path === l.href || path.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-amber-400 text-slate-900" : "text-slate-200 hover:bg-slate-800"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3">
          <p className="text-sm text-slate-600">
            Signed in as <strong className="text-slate-900">{record.displayName || record.email}</strong>{" "}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{ROLE_LABEL[role]}</span>
          </p>
          <div className="flex gap-2">
            <a href="/en" target="_blank" rel="noopener noreferrer" className={btnSecondary}>View website</a>
            <button className={btnSecondary} onClick={() => backend.signOut()}>Sign out</button>
          </div>
        </header>
        <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
