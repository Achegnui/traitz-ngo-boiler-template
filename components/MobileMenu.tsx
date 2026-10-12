"use client";
import { useEffect, useRef, useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { monoLabel } from "@/components/ui/typography";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type L = { href: string; label: string };

/** The slide-in menu: a shadcn Sheet (Radix Dialog), so focus is trapped and Esc closes it. Loaded lazily by MobileNav. */
export function MobileMenu({ links, cta, labels }: { links: L[]; cta: L; labels: { menu: string; close: string; language: string; mainNav: string } }) {
  const [open, setOpen] = useState(true); // mounted by MobileNav when the person taps the burger
  const path = usePathname();
  const lastPath = useRef(path);
  useEffect(() => { if (lastPath.current !== path) { lastPath.current = path; setOpen(false); } }, [path]); // close after navigating, not on mount

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={labels.menu}
          className="hidden size-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full border border-white/30 bg-transparent p-0 max-[860px]:flex"
        >
          <span aria-hidden="true" className="block h-0.5 w-[18px] rounded-[2px] bg-white" />
          <span aria-hidden="true" className="block h-0.5 w-[18px] rounded-[2px] bg-white" />
          <span aria-hidden="true" className="block h-0.5 w-[18px] rounded-[2px] bg-white" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        animated={false}
        showCloseButton={false}
        aria-describedby={undefined}
        overlayClassName="bg-brand-anchor/60 backdrop-blur-[3px]"
        className="w-[min(88vw,380px)] max-w-none gap-0 border-0 bg-brand-anchor p-0 text-white shadow-none data-[state=open]:animate-slidein sm:max-w-none"
      >
        <SheetTitle className="sr-only">{labels.menu}</SheetTitle>
        <div className="box-border flex h-full flex-col overflow-auto px-6 pt-5 pb-7">
          <SheetClose asChild>
            <button
              type="button"
              aria-label={labels.close}
              autoFocus
              className="grid size-11 cursor-pointer place-items-center self-end rounded-full border border-white/30 bg-transparent text-white"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
          </SheetClose>
          <nav aria-label={labels.mainNav} className="mt-4 flex flex-col">
            {links.map((l, i) => (
              <SheetClose asChild key={l.href}>
                <Link href={l.href} className="flex items-baseline gap-4 border-b border-white/12 py-4 font-display text-[28px] font-bold leading-[normal] tracking-[-0.02em]">
                  <span className={cn(monoLabel, "text-[11px] text-brand-accent")}>{String(i + 1).padStart(2, "0")}</span>
                  {l.label}
                </Link>
              </SheetClose>
            ))}
          </nav>
          <div className="mt-auto flex flex-col items-start gap-5 pt-7">
            <LocaleSwitcher label={labels.language} />
            <SheetClose asChild>
              <Button asChild arrow>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
