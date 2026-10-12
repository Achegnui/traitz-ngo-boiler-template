"use client";
import { animate } from "motion/mini";
import { useEffect, useRef } from "react";
import { onceInView, prefersReducedMotion } from "@/lib/inview";

/** The server renders the real width. After hydration it empties and fills when first in view. The ticks below the bar make it a ruler. */
export function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    el.style.width = "0%";
    const stop = onceInView(el, () => {
      animate(el, { width: ["0%", `${percent}%`] }, { duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }).finished.then(() => { el.style.width = `${percent}%`; });
    });
    return () => { stop(); el.style.width = `${percent}%`; };
  }, [percent]);
  return (
    <div
      className="relative h-2 bg-brand-ink/10 after:absolute after:top-full after:right-0 after:left-0 after:h-1.5 after:content-[''] after:[background:repeating-linear-gradient(90deg,color-mix(in_srgb,var(--brand-ink)_40%,transparent)_0_1px,transparent_1px_10%)]"
      role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
    >
      <i ref={ref} className="block h-full bg-brand-accent" style={{ width: `${percent}%` }} />
    </div>
  );
}
