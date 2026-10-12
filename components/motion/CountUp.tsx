"use client";
import { useEffect, useRef } from "react";
import { onceInView, prefersReducedMotion } from "@/lib/inview";

/** The server renders the final number. After hydration it resets to 0 and counts up when first in view. */
export function CountUp({ value, locale, prefix = "", suffix = "" }: { value: number; locale: string; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = new Intl.NumberFormat(locale).format(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const fmt = new Intl.NumberFormat(locale);
    let raf = 0;
    el.textContent = fmt.format(0);
    const stop = onceInView(el, () => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1400);
        el.textContent = fmt.format(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => { stop(); cancelAnimationFrame(raf); el.textContent = fmt.format(value); };
  }, [value, locale]);
  return <span>{prefix}<span ref={ref}>{final}</span>{suffix}</span>;
}
