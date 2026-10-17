"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppLink } from "@/components/ui/AppLink";
import { Button } from "@/components/ui/button";
import { headingXl } from "@/components/ui/typography";
import { fetchDonationStatus, fill, POLL_EVERY_MS, POLL_MAX_MS, resolveDonationId, type ThanksStrings } from "@/lib/donate-client";
import { cn } from "@/lib/utils";

type View =
  | { kind: "checking"; offline: boolean }
  | { kind: "completed"; amount: number; frequency: "one-time" | "monthly" }
  | { kind: "failed" }
  | { kind: "timeout" }
  | { kind: "notfound" };

/** Asks /api/donate/status every few seconds until the payment is completed or failed, or three minutes have passed. */
export function DonationStatus({ t, locale }: { t: ThanksStrings; locale: string }) {
  const fromUrl = useSearchParams().get("d");
  const [id, setId] = useState<string | null | undefined>(undefined); // undefined: not looked up yet
  const [view, setView] = useState<View>({ kind: "checking", offline: false });
  const [run, setRun] = useState(0);

  useEffect(() => { setId(resolveDonationId(fromUrl)); }, [fromUrl]);

  useEffect(() => {
    if (id === undefined) return;
    if (id === null) { setView({ kind: "notfound" }); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();
    setView({ kind: "checking", offline: false });
    const tick = async () => {
      const r = await fetchDonationStatus(id);
      if (cancelled) return;
      if (r.kind === "notfound") { setView({ kind: "notfound" }); return; }
      if (r.kind === "ok" && r.status === "completed") { setView({ kind: "completed", amount: r.amount, frequency: r.frequency }); return; }
      if (r.kind === "ok" && r.status === "failed") { setView({ kind: "failed" }); return; }
      if (Date.now() - started >= POLL_MAX_MS) { setView({ kind: "timeout" }); return; }
      setView({ kind: "checking", offline: r.kind === "error" });
      timer = setTimeout(tick, POLL_EVERY_MS);
    };
    void tick();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [id, run]);

  const nf = new Intl.NumberFormat(locale);
  const card = "grid gap-4 rounded-2xl border border-brand-ink bg-white p-8";
  const h = cn(headingXl, "text-[34px]");
  const body = "text-brand-muted";

  return (
    <div className={card} role="status" aria-live="polite">
      {view.kind === "checking" && (
        <>
          <h2 className={h}>{t.checkingTitle}</h2>
          <p className={body}>{t.checkingBody}</p>
          {view.offline && <p className="text-[14px] font-semibold">{t.retrying}</p>}
        </>
      )}
      {view.kind === "completed" && (
        <>
          <h2 className={h}>{t.completedTitle}</h2>
          <p className={body}>{fill(t.completedBody, { amount: nf.format(view.amount) })}</p>
          {view.frequency === "monthly" && <p className={body}>{t.completedMonthly}</p>}
          <div><Button asChild arrow><AppLink href="/">{t.home}</AppLink></Button></div>
        </>
      )}
      {view.kind === "failed" && (
        <>
          <h2 className={h}>{t.failedTitle}</h2>
          <p className={body}>{t.failedBody}</p>
          <div className="flex flex-wrap gap-2.5">
            <Button asChild arrow><AppLink href="/donate">{t.tryAgain}</AppLink></Button>
            <Button asChild variant="outline"><AppLink href="/contact">{t.contact}</AppLink></Button>
          </div>
        </>
      )}
      {view.kind === "timeout" && (
        <>
          <h2 className={h}>{t.timeoutTitle}</h2>
          <p className={body}>{t.timeoutBody}</p>
          <div><Button type="button" arrow onClick={() => setRun((n) => n + 1)}>{t.checkAgain}</Button></div>
        </>
      )}
      {view.kind === "notfound" && (
        <>
          <h2 className={h}>{t.notFoundTitle}</h2>
          <p className={body}>{t.notFoundBody}</p>
          <div className="flex flex-wrap gap-2.5">
            <Button asChild arrow><AppLink href="/donate">{t.tryAgain}</AppLink></Button>
            <Button asChild variant="outline"><AppLink href="/contact">{t.contact}</AppLink></Button>
          </div>
        </>
      )}
    </div>
  );
}
