import { brand } from "@/theme/brand.config";
import { cn } from "@/lib/utils";

/** Small uppercase label (replaces the legacy .mono class). `leading-[normal]` matches the old `font:` shorthand. */
export const monoLabel = "font-mono text-[12px] font-medium uppercase leading-[normal] tracking-[.14em]";

/** Large section heading (replaces the legacy .h2 class). */
export const headingXl = "max-w-[780px] font-display text-[clamp(34px,4.6vw,60px)] font-extrabold leading-[1.02] tracking-[-0.03em]";

/** Wordmark in the header and footer. */
export const logoClass = "font-display text-[22px] font-extrabold leading-[normal] tracking-[-0.03em] max-[480px]:text-[16px] max-[340px]:text-[14px]";

/** Muted intro paragraph under a heading. */
export const leadClass = "mt-3.5 max-w-[600px] text-brand-muted";

/** Row of buttons. */
export const btnRow = "mt-5 flex flex-wrap gap-2.5";

/** Entrance animations (keyframes live in globals.css). Content is visible by default; fadeUp only hides it once the inline script in the layout has set <html class="js">, so no-JS visitors see everything. The headline slides but never starts transparent. */
export const slideIn = "[transform:translateY(14px)] animate-up-t motion-reduce:[transform:none]";
export const fadeUp = "[.js_&]:opacity-0 [.js_&]:[transform:translateY(14px)] [.js_&]:animate-up motion-reduce:[.js_&]:opacity-100 motion-reduce:[.js_&]:[transform:none]";

/** Square icon stamp with an offset amber shadow. */
export const stampClass = "grid size-[58px] flex-none place-items-center rounded-[8px] border-[1.5px] border-brand-ink bg-white text-brand-ink shadow-[5px_5px_0_var(--brand-accent)]";

/** Bold link with an amber underline. Add `moreLinkHover` for the gap-opening hover. */
export const moreLink = "inline-flex items-center gap-1.5 border-b-2 border-brand-accent pb-0.5 font-bold";
export const moreLinkHover = "[transition:gap_.2s] hover:gap-2.5";

/** Print-style frame for photographs: an offset outline behind the image. `figMedia` goes on the Media inside it. */
export const figClass = "relative mr-[18px] before:absolute before:inset-[18px_-18px_-18px_18px] before:z-0 before:rounded-[4px] before:border-2 before:border-brand-ink before:content-[''] max-[700px]:mr-3 max-[700px]:before:inset-[12px_-12px_-12px_12px]";
export const figMedia = "relative z-1 m-0 aspect-[5/4] rounded-[4px]";
export const figCaption = cn(monoLabel, "relative z-1 mt-[38px] text-[11px] text-brand-muted");

/** Long-form text column: every direct child is capped at 720px. */
export const proseWrap = "max-w-none [&>*]:max-w-[720px]";
export const proseP = (i: number) => cn("text-brand-muted", i > 0 && "mt-[1em]");

/** Heavy rule above ruled lists and ledgers. */
export const ruleTop = "border-t-2 border-brand-ink";
export const listReset = "m-0 list-none p-0";

export function BrandMark() {
  return (
    <>
      {brand.name}
      <b className="text-brand-accent">.</b>
      {brand.suffix}
    </>
  );
}

/** Three-up card grid (2 up at 900px, 1 up at 600px). */
export const cardGrid = "mt-12 grid grid-cols-3 gap-6 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1";
