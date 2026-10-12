"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { headingXl } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type Strings = Record<"amount" | "custom" | "frequency" | "once" | "monthly" | "programme" | "general" | "name" | "email" | "submit" | "soon" | "phone" | "formTitle", string>;
const PRESETS = [5000, 10000, 25000, 50000];

const focusRing = "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-accent";
const field = cn("h-auto w-full rounded-[10px] border-brand-ink/30 bg-white px-3.5 py-3 text-[17px] leading-[1.6] text-brand-ink shadow-none focus-visible:ring-0 md:text-[17px]", focusRing);
const select = cn("w-full rounded-[10px] border border-brand-ink/30 bg-white px-3.5 py-3 text-brand-ink", focusRing);
const labelCls = "mb-1.5 block text-[15px] leading-[1.6] font-semibold";
const hit = "absolute inset-0 m-0 size-full cursor-pointer opacity-0";
const choice = "relative cursor-pointer font-semibold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-accent";

/** The donation form's interface. Payment is connected in the next phase; until then nothing is sent. */
export function DonateForm({ t, programmes, locale }: { t: Strings; programmes: { id: string; label: string }[]; locale: string }) {
  const q = useSearchParams().get("programme") ?? "";
  const [amount, setAmount] = useState<number | "custom">(10000);
  const [custom, setCustom] = useState("");
  const [freq, setFreq] = useState<"once" | "monthly">("once");
  const [prog, setProg] = useState(programmes.some((p) => p.id === q) ? q : "");
  const nf = new Intl.NumberFormat(locale);
  const total = amount === "custom" ? Number(custom) || 0 : amount;

  return (
    <form className="grid gap-6 rounded-2xl border border-brand-ink bg-white p-8" onSubmit={(e) => e.preventDefault()} aria-describedby="dsoon">
      <h2 className={cn(headingXl, "text-[34px]")}>{t.formTitle}</h2>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2.5 p-0 font-bold">{t.frequency}</legend>
        <div className="flex w-max max-w-full rounded-full border border-brand-ink p-1" role="radiogroup" aria-label={t.frequency}>
          {(["once", "monthly"] as const).map((f) => (
            <label key={f} className={cn(choice, "rounded-full px-5 py-2", freq === f && "bg-brand-ink text-white")}><input className={hit} type="radio" name="freq" checked={freq === f} onChange={() => setFreq(f)} />{t[f]}</label>
          ))}
        </div>
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
          <div><Label htmlFor="dcustom" className="sr-only">{t.custom}</Label><Input id="dcustom" className={field} inputMode="numeric" pattern="[0-9]*" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} placeholder="XAF" /></div>
        )}
      </fieldset>
      <div><Label htmlFor="dprog" className={labelCls}>{t.programme}</Label>
        <select id="dprog" className={select} value={prog} onChange={(e) => setProg(e.target.value)}>
          <option value="">{t.general}</option>
          {programmes.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3.5 max-[900px]:grid-cols-1">
        <div><Label htmlFor="dname" className={labelCls}>{t.name}</Label><Input id="dname" className={field} autoComplete="name" /></div>
        <div><Label htmlFor="demail" className={labelCls}>{t.email}</Label><Input id="demail" className={field} type="email" autoComplete="email" /></div>
      </div>
      <Button type="submit" arrow className="w-max max-w-full" disabled aria-disabled="true">{t.submit}{total ? ` · ${nf.format(total)} XAF` : ""}</Button>
      <p className="text-[14px] text-brand-muted">{t.phone}</p>
      <p id="dsoon" className="border-l-[3px] border-brand-accent bg-brand-tint px-3.5 py-2.5 text-[14px]" role="note">{t.soon}</p>
    </form>
  );
}
