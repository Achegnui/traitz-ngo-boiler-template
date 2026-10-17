"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { headingXl } from "@/components/ui/typography";
import { MAX_AMOUNT, MIN_AMOUNT } from "@/lib/donation-limits";
import { fill, submitDonation, totalOf, validateForm, type DonateFormStrings, type ErrorKey, type FieldErrors, type Frequency } from "@/lib/donate-client";
import { cn } from "@/lib/utils";

const PRESETS = [5000, 10000, 25000, 50000];

const focusRing = "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-accent";
const field = cn("h-auto w-full rounded-[10px] border-brand-ink/30 bg-white px-3.5 py-3 text-[17px] leading-[1.6] text-brand-ink shadow-none focus-visible:ring-0 aria-invalid:border-destructive md:text-[17px]", focusRing);
const select = cn("w-full rounded-[10px] border border-brand-ink/30 bg-white px-3.5 py-3 text-brand-ink", focusRing);
const labelCls = "mb-1.5 block text-[15px] leading-[1.6] font-semibold";
const hit = "absolute inset-0 m-0 size-full cursor-pointer opacity-0";
const choice = "relative cursor-pointer font-semibold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-accent";
const fieldError = "mt-1.5 text-[14px] font-semibold text-destructive";

/** The donation form. Submitting saves a pending donation on the server and sends the donor to Fapshi's Mobile Money page. */
export function DonateForm({ t, programmes, locale }: { t: DonateFormStrings; programmes: { id: string; label: string }[]; locale: string }) {
  const q = useSearchParams().get("programme") ?? "";
  const [amount, setAmount] = useState<number | "custom">(10000);
  const [custom, setCustom] = useState("");
  const [freq, setFreq] = useState<Frequency>("once");
  const [prog, setProg] = useState(programmes.some((p) => p.id === q) ? q : "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<ErrorKey | null>(null);
  const [busy, setBusy] = useState(false);
  const nf = new Intl.NumberFormat(locale);
  const total = totalOf(amount, custom);

  // Coming back from the payment page with the browser's back button restores this page as it was: let the donor try again.
  useEffect(() => {
    const restored = (e: PageTransitionEvent) => { if (e.persisted) setBusy(false); };
    window.addEventListener("pageshow", restored);
    return () => window.removeEventListener("pageshow", restored);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const result = validateForm({ amount, custom, name, email, freq, programmeId: prog, locale });
    if (!result.ok) {
      setErrors(result.errors);
      setFailure(null);
      document.getElementById(result.errors.amount ? "dcustom" : result.errors.name ? "dname" : "demail")?.focus();
      return;
    }
    setErrors({});
    setFailure(null);
    setBusy(true);
    const sent = await submitDonation(result.payload);
    if (sent.ok) {
      window.location.assign(sent.link); // stays "busy" while the browser leaves for the payment page
      return;
    }
    setFailure(sent.error);
    setBusy(false);
  }

  return (
    <form className="grid grid-cols-[minmax(0,1fr)] gap-6 rounded-2xl border border-brand-ink bg-white p-8" onSubmit={onSubmit} noValidate>
      <h2 className={cn(headingXl, "text-[34px]")}>{t.formTitle}</h2>
      <noscript><p className="border-l-[3px] border-brand-accent bg-brand-tint px-3.5 py-2.5 text-[14px]">{t.noScript}</p></noscript>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2.5 p-0 font-bold">{t.frequency}</legend>
        <div className="flex w-max max-w-full rounded-full border border-brand-ink p-1" role="radiogroup" aria-label={t.frequency}>
          {(["once", "monthly"] as const).map((f) => (
            <label key={f} className={cn(choice, "rounded-full px-5 py-2", freq === f && "bg-brand-ink text-white")}><input className={hit} type="radio" name="freq" checked={freq === f} onChange={() => setFreq(f)} />{t[f]}</label>
          ))}
        </div>
        {freq === "monthly" && <p id="dmonthly" className="mt-2.5 text-[14px] text-brand-muted">{t.monthlyNote}</p>}
      </fieldset>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2.5 p-0 font-bold">{t.amount}</legend>
        <div className="grid grid-cols-5 gap-2.5 max-[900px]:grid-cols-3">
          {PRESETS.map((a) => (
            <label key={a} className={cn(choice, "rounded-[12px] border px-1.5 py-3.5 text-center [transition:background_.15s,color_.15s,border-color_.15s]", amount === a ? "border-brand-ink bg-brand-ink text-white" : "border-border")}><input className={hit} type="radio" name="amt" checked={amount === a} onChange={() => setAmount(a)} /><b className="block font-display text-[19px] leading-[normal] font-extrabold">{nf.format(a)}</b></label>
          ))}
          <label className={cn(choice, "rounded-[12px] border px-1.5 py-3.5 text-center [transition:background_.15s,color_.15s,border-color_.15s]", amount === "custom" ? "border-brand-ink bg-brand-ink text-white" : "border-border")}><input className={hit} type="radio" name="amt" checked={amount === "custom"} onChange={() => setAmount("custom")} />{t.custom}</label>
        </div>
        {amount === "custom" && (
          <div>
            <Label htmlFor="dcustom" className="sr-only">{t.custom}</Label>
            <Input id="dcustom" className={field} inputMode="numeric" pattern="[0-9]*" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} placeholder="XAF" aria-invalid={errors.amount ? true : undefined} aria-describedby={errors.amount ? "dcustom-err" : undefined} />
            {errors.amount && <p id="dcustom-err" className={fieldError}>{fill(t.errAmount, { min: nf.format(MIN_AMOUNT), max: nf.format(MAX_AMOUNT) })}</p>}
          </div>
        )}
      </fieldset>
      <div><Label htmlFor="dprog" className={labelCls}>{t.programme}</Label>
        <select id="dprog" className={select} value={prog} onChange={(e) => setProg(e.target.value)}>
          <option value="">{t.general}</option>
          {programmes.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3.5 max-[900px]:grid-cols-1">
        <div>
          <Label htmlFor="dname" className={labelCls}>{t.name}</Label>
          <Input id="dname" className={field} autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? "dname-err" : undefined} />
          {errors.name && <p id="dname-err" className={fieldError}>{t.errName}</p>}
        </div>
        <div>
          <Label htmlFor="demail" className={labelCls}>{t.email}</Label>
          <Input id="demail" className={field} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? "demail-err" : undefined} />
          {errors.email && <p id="demail-err" className={fieldError}>{t.errEmail}</p>}
        </div>
      </div>
      {failure && <p role="alert" className="border-l-[3px] border-destructive bg-brand-tint px-3.5 py-2.5 text-[14px]">{t[failure]}</p>}
      <Button type="submit" arrow className="w-max max-w-full" disabled={busy} aria-busy={busy}>
        {busy ? t.submitting : `${t.submit}${total ? ` · ${nf.format(total)} XAF` : ""}`}
      </Button>
      <p className="text-[14px] text-brand-muted">{t.phone}</p>
    </form>
  );
}
