"use client";
import { lazy, Suspense, useEffect, useState } from "react";

type L = { href: string; label: string };
type Props = { links: L[]; cta: L; labels: { menu: string; close: string; language: string; mainNav: string } };

const MobileMenu = lazy(() => import("./MobileMenu").then((m) => ({ default: m.MobileMenu })));
const warm = () => { void import("./MobileMenu"); };

function Burger({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button" aria-label={label} aria-haspopup="dialog" aria-expanded="false"
      onClick={onClick} onPointerEnter={warm} onFocus={warm} onTouchStart={warm}
      className="hidden size-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full border border-white/30 bg-transparent p-0 max-[860px]:flex"
    >
      <span aria-hidden="true" className="block h-0.5 w-[18px] rounded-[2px] bg-white" />
      <span aria-hidden="true" className="block h-0.5 w-[18px] rounded-[2px] bg-white" />
      <span aria-hidden="true" className="block h-0.5 w-[18px] rounded-[2px] bg-white" />
    </button>
  );
}

/**
 * The burger button is in the page from the start; the Sheet it opens (about 15 kB of dialog code) is not.
 * It is fetched once the browser is idle, or sooner on hover, focus or touch, and opens the moment it is ready.
 */
export function MobileNav(props: Props) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback as typeof window.requestIdleCallback | undefined;
    if (ric) { const id = ric(warm, { timeout: 5000 }); return () => window.cancelIdleCallback(id); }
    const t = window.setTimeout(warm, 3000);
    return () => window.clearTimeout(t);
  }, []);
  const button = <Burger label={props.labels.menu} onClick={() => setArmed(true)} />;
  return armed ? <Suspense fallback={button}><MobileMenu {...props} /></Suspense> : button;
}
