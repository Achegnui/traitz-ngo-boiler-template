"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/admin/AuthProvider";
import { Alert, btnPrimary, fieldCls } from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { backend } from "@/lib/admin/backend";

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "The email or password is not correct.",
  "auth/wrong-password": "The email or password is not correct.",
  "auth/user-not-found": "The email or password is not correct.",
  "auth/invalid-email": "That does not look like an email address.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes, or use “Forgot password”.",
  "auth/network-request-failed": "No internet connection. Check your connection and try again.",
  "auth/user-disabled": "This account has been disabled.",
};
const explain = (e: unknown) => MESSAGES[(e as { code?: string })?.code ?? ""] ?? "Sign-in failed. Please try again.";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => { if (auth.status === "ready" || auth.status === "unauthorized") router.replace("/admin/dashboard"); }, [auth.status, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setInfo("");
    try { await backend.signIn(email.trim(), password); }
    catch (err) { setError(explain(err)); setBusy(false); }
  }
  async function reset() {
    setError(""); setInfo("");
    if (!email.trim()) return setError("Type your email address above first, then click “Forgot password”.");
    try { await backend.sendReset(email.trim()); } catch { /* do not reveal whether the account exists */ }
    setInfo("If that email belongs to a staff account, a password reset link is on its way. Check your spam folder too.");
  }

  return (
    <main className="mx-auto mt-16 max-w-sm px-4">
      <div className="rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Traitz <span className="text-amber-700">admin</span></h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to manage the website.</p>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <Label htmlFor="email" className="mb-1 block text-sm leading-5 font-semibold">Email</Label>
            <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <Label htmlFor="password" className="mb-1 block text-sm leading-5 font-semibold">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={fieldCls} />
          </div>
          {error && <Alert tone="error">{error}</Alert>}
          {info && <Alert tone="success">{info}</Alert>}
          <button type="submit" className={`${btnPrimary} w-full`} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <button type="button" onClick={reset} className="mt-4 text-sm text-slate-600 underline hover:text-slate-900">Forgot password?</button>
      </div>
    </main>
  );
}
