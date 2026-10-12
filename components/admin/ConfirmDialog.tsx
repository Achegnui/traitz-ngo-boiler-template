"use client";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { btnDanger, btnPrimary, btnSecondary } from "./ui";

type Opts = { title: string; message?: string; confirmLabel?: string; tone?: "danger" | "default" };
const Ctx = createContext<(o: Opts) => Promise<boolean>>(async () => false);

/** `const confirm = useConfirm(); if (await confirm({...})) ...` A styled, keyboard-friendly replacement for window.confirm (shadcn AlertDialog). */
export const useConfirm = () => useContext(Ctx);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const [opts, setOpts] = useState<Opts | null>(null);
  const [open, setOpen] = useState(false);

  const ask = useCallback((o: Opts) => new Promise<boolean>((res) => { resolver.current = res; setOpts(o); setOpen(true); }), []);
  const close = (v: boolean) => {
    setOpen(false);
    resolver.current?.(v);
    resolver.current = null;
  };
  const danger = opts?.tone !== "default";

  return (
    <Ctx.Provider value={ask}>
      {children}
      <AlertDialog open={open} onOpenChange={(o) => { if (!o) close(false); }}>
        <AlertDialogContent
          animated={false}
          {...(opts?.message ? {} : { "aria-describedby": undefined })}
          overlayClassName="bg-slate-900/55 backdrop-blur-[3px]"
          className="w-[min(92vw,26rem)] max-w-none gap-0 rounded-2xl border-0 p-6 shadow-2xl data-[state=open]:animate-pop sm:max-w-none"
        >
          {opts && (
            <>
              <div className={cn("mb-4 grid size-11 place-items-center rounded-full", danger ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800")} aria-hidden="true">
                {danger ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" /></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
                )}
              </div>
              <AlertDialogHeader className="gap-0 text-left">
                <AlertDialogTitle className="text-lg font-bold">{opts.title}</AlertDialogTitle>
                {opts.message && <AlertDialogDescription className="mt-1.5 leading-relaxed text-slate-600">{opts.message}</AlertDialogDescription>}
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex-row flex-wrap justify-end gap-2 sm:flex-row sm:justify-end">
                <AlertDialogCancel className={btnSecondary}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={danger ? cn(btnDanger, "border-red-700 bg-red-700 text-white hover:bg-red-700") : btnPrimary}
                  onClick={() => close(true)}
                >
                  {opts.confirmLabel ?? (danger ? "Delete" : "Confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </Ctx.Provider>
  );
}
