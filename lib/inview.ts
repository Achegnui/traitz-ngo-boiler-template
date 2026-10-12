/** Tiny client helpers shared by the motion enhancements. */
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Calls `cb` once when `el` first reaches `threshold` visibility. Returns a cleanup function. */
export function onceInView(el: Element, cb: () => void, threshold = 0): () => void {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); cb(); }
  }, { threshold });
  io.observe(el);
  return () => io.disconnect();
}
