import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { AppLink } from "@/components/ui/AppLink";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Section";
import { BrandMark, logoClass } from "@/components/ui/typography";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/i18n";
import type { SiteContent } from "@/lib/types";

export async function Header({ site, locale }: { site: SiteContent; locale: Locale }) {
  const tr = await getTranslations({ locale, namespace: "common" });
  const { nav, cta } = site.header;
  return (
    <header className="sticky top-0 z-20 bg-brand-anchor/92 pt-[env(safe-area-inset-top,0px)] text-white backdrop-blur-[10px]">
      <Container className="flex h-[72px] items-center justify-between gap-4 max-[480px]:gap-2">
        <AppLink className={logoClass} href="/"><BrandMark /></AppLink>
        <nav className="flex gap-7 text-[15px] max-[860px]:hidden" aria-label={tr("mainNav")}>
          {nav.map((n) => (
            <AppLink key={n.href} href={n.href} className="opacity-80 [transition:opacity_.18s] hover:opacity-100">
              {localize(n.label, locale)}
            </AppLink>
          ))}
        </nav>
        <div className="flex items-center gap-4 max-[480px]:gap-2">
          <LocaleSwitcher label={tr("language")} className="max-[560px]:hidden" />
          <Button asChild arrow className="whitespace-nowrap max-[480px]:px-3 max-[480px]:py-[9px]" arrowClassName="max-[480px]:hidden">
            <AppLink href={cta.href}>{localize(cta.label, locale)}</AppLink>
          </Button>
          <MobileNav
            links={nav.map((n) => ({ href: n.href, label: localize(n.label, locale) }))}
            cta={{ href: cta.href, label: localize(cta.label, locale) }}
            labels={{ menu: tr("menu"), close: tr("closeMenu"), language: tr("language"), mainNav: tr("mainNav") }}
          />
        </div>
      </Container>
    </header>
  );
}
