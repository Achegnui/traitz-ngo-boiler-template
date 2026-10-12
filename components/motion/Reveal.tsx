"use client";
import { animate } from "motion/mini";
import { useEffect, useRef, type ReactNode } from "react";
import { onceInView, prefersReducedMotion } from "@/lib/inview";

/**
 * Progressive enhancement: the server renders this fully visible. After hydration, and only if
 * motion is allowed, anything still below the fold is hidden and then eased in as it scrolls into view.
 * No JS, a JS failure, or prefers-reduced-motion all leave the content visible.
 * Uses Motion's WAAPI build (motion/mini), so the animation runs off the main thread.
 */
export function Reveal({ children, i = 0, className }: { children: ReactNode; i?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already on screen: leave it alone
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    const stop = onceInView(el, () => {
      const a = animate(el, { opacity: [0, 1], transform: ["translateY(12px)", "translateY(0px)"] }, { duration: 0.55, delay: i * 0.08, ease: [0.2, 0.7, 0.2, 1] });
      a.finished.then(() => { el.style.opacity = ""; el.style.transform = ""; });
    }, 0.2);
    return () => { stop(); el.style.opacity = ""; el.style.transform = ""; };
  }, [i]);
  return <div ref={ref} className={className}>{children}</div>;
}
