"use client";
import { useLocale } from "next-intl";
import { monoLabel } from "@/components/ui/typography";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Keeps the current path when switching language. */
export function LocaleSwitcher({ label, className }: { label: string; className?: string }) {
  const current = useLocale();
  const pathname = usePathname();
  return (
    <nav className={cn("flex gap-1.5 max-[480px]:gap-1 max-[480px]:tracking-[.08em]", monoLabel, className)} aria-label={label}>
      {routing.locales.map((l, i) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          lang={l}
          aria-current={l === current ? "true" : undefined}
          className={cn(
            "opacity-60 [transition:opacity_.18s] hover:opacity-100 aria-[current=true]:opacity-100",
            i > 0 && "before:mr-1.5 before:opacity-50 before:content-['/']",
          )}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
