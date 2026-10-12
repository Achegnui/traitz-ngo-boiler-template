"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useStaff } from "@/components/admin/AuthProvider";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Alert, btnDanger, btnPrimary, btnSecondary, fieldCls, Loading, PageTitle, rowThCls, tableWrap, tdCls, thCls, trCls } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { backend } from "@/lib/admin/backend";
import { explainError } from "@/lib/admin/save";
import { can, ROLE_LABEL, type StaffRow } from "@/lib/admin/types";
import type { Role } from "@/lib/types";

const ROLES: Role[] = ["administrator", "editor", "contributor"];
const ROLE_HELP: Record<Role, string> = {
  administrator: "Everything, including adding and removing staff.",
  editor: "Create, edit, publish and delete content. Read messages and donations.",
  contributor: "Create and edit drafts only. An editor publishes them.",
};

const authMessage = (e: unknown) => {
  const code = (e as { code?: string })?.code;
  if (code === "auth/email-already-in-use") return "That email already has a sign-in account. Ask them to sign in once, then add their staff record in the Firebase console (Firestore > admins > document named with their UID).";
  if (code === "auth/invalid-email") return "That does not look like an email address.";
  return explainError(e);
};

export default function Users() {
  const { user, record } = useStaff();
  const confirm = useConfirm();
  const [rows, setRows] = useState<StaffRow[] | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("contributor");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => { try { setRows((await backend.listStaff()).sort((a, b) => a.email.localeCompare(b.email))); } catch (e) { setError(explainError(e)); setRows([]); } }, []);
  useEffect(() => { load(); }, [load]);

  if (!can.manageStaff(record.role)) return <Alert tone="warn">Only administrators can manage staff.</Alert>;
  const admins = (rows ?? []).filter((r) => r.role === "administrator").length;

  async function add(e: FormEvent) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      await backend.createStaffAccount(email.trim().toLowerCase(), name.trim(), role);
      toast.success(`Added ${email.trim()}. They have been emailed a link to choose their own password (it may land in spam).`);
      setEmail(""); setName(""); setRole("contributor"); await load();
    } catch (err) { setError(authMessage(err)); }
    finally { setBusy(false); }
  }
  async function changeRole(r: StaffRow, next: Role) {
    setError("");
    if (r.uid === user.uid && next !== "administrator" && admins <= 1) return setError("You are the only administrator. Make someone else an administrator first.");
    try { const { uid, ...rec } = r; await backend.saveStaff(uid, { ...rec, role: next }); toast.success(`${r.email} is now ${ROLE_LABEL[next]}.`); await load(); }
    catch (err) { setError(explainError(err)); }
  }
  async function remove(r: StaffRow) {
    setError("");
    if (r.uid === user.uid) return setError("You cannot remove your own access.");
    if (r.role === "administrator" && admins <= 1) return setError("You cannot remove the only administrator.");
    if (!(await confirm({ title: `Remove access for ${r.email}?`, message: "Their sign-in account stays, but they will no longer be able to use the admin.", confirmLabel: "Remove access" }))) return;
    try { await backend.removeStaff(r.uid); toast.success(`${r.email} no longer has access.`); await load(); } catch (err) { setError(explainError(err)); }
  }

  return (
    <>
      <PageTitle title="Users" />
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      {rows === null ? <Loading /> : (
        <div className={tableWrap}>
          <Table>
            <TableCaption className="sr-only">Staff</TableCaption>
            <TableHeader className="bg-slate-50 [&_tr]:border-b-0">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead scope="col" className={thCls}>Person</TableHead>
                <TableHead scope="col" className={thCls}>Role</TableHead>
                <TableHead scope="col" className={cn(thCls, "text-right")}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.uid} className={trCls}>
                  <TableHead scope="row" className={rowThCls}>{r.displayName || r.email}<span className="block text-xs font-normal text-slate-500">{r.email}{r.uid === user.uid ? " (you)" : ""}</span></TableHead>
                  <TableCell className={tdCls}>
                    <Label className="sr-only" htmlFor={`role-${r.uid}`}>Role for {r.email}</Label>
                    <AdminSelect id={`role-${r.uid}`} value={r.role} onChange={(v) => changeRole(r, v as Role)} className="max-w-44" options={ROLES.map((x) => ({ value: x, label: ROLE_LABEL[x] }))} />
                  </TableCell>
                  <TableCell className={cn(tdCls, "text-right")}><button type="button" className={btnDanger} onClick={() => remove(r)} aria-label={`Remove ${r.email}`}>Remove</button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <form onSubmit={add} className="mt-8 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold">Add a person</h2>
        <p className="mb-4 text-sm text-slate-600">They receive an email with a link to set their own password. You never see or share a password.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="u-email" className="mb-1 block text-sm leading-5 font-semibold">Email</Label><Input id="u-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldCls} /></div>
          <div><Label htmlFor="u-name" className="mb-1 block text-sm leading-5 font-semibold">Name</Label><Input id="u-name" required value={name} onChange={(e) => setName(e.target.value)} className={fieldCls} /></div>
          <div className="sm:col-span-2">
            <Label htmlFor="u-role" className="mb-1 block text-sm leading-5 font-semibold">Role</Label>
            <AdminSelect id="u-role" value={role} onChange={(v) => setRole(v as Role)} className="max-w-xs" aria-describedby="u-role-help" options={ROLES.map((x) => ({ value: x, label: ROLE_LABEL[x] }))} />
            <p id="u-role-help" className="mt-1 text-xs text-slate-500">{ROLE_HELP[role]}</p>
          </div>
        </div>
        <button type="submit" className={`${btnPrimary} mt-5`} disabled={busy}>{busy ? "Adding…" : "Add person"}</button>
        <button type="button" className={`${btnSecondary} ml-3 mt-5`} onClick={() => { setEmail(""); setName(""); }}>Clear</button>
      </form>
    </>
  );
}
