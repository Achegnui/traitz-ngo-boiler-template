import { AppLink } from "@/components/ui/AppLink";
import { Container } from "@/components/ui/Section";
import { BrandMark, logoClass } from "@/components/ui/typography";
import type { Locale } from "@/i18n/routing";
import { localize } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/types";
import { brand } from "@/theme/brand.config";

export function Footer({ site, locale }: { site: SiteContent; locale: Locale }) {
  const { footer } = site;
  return (
    <footer className="grain contour-light relative overflow-hidden bg-brand-anchor pt-[72px] text-[15px] text-white/72">
      <Container className="relative z-2">
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-8 max-[700px]:grid-cols-1">
          <div>
            <div className={cn(logoClass, "text-white")}><BrandMark /></div>
            <p className="mt-3 max-w-[340px]">{localize(footer.about, locale)}</p>
          </div>
          {footer.columns.map((c) => (
            <div key={c.title.en}>
              <h2 className="mb-2 font-sans text-[15px] font-semibold leading-[normal] text-white">{localize(c.title, locale)}</h2>
              {c.links.map((k) => <AppLink key={k.href} href={k.href} className="block py-[3px]">{localize(k.label, locale)}</AppLink>)}
            </div>
          ))}
        </div>
        <p className="mt-12 text-[13px] opacity-70">{localize(footer.copy, locale)}</p>
        <p
          className="mt-10 h-[clamp(60px,13vw,190px)] overflow-hidden leading-[0.8] before:block before:font-display before:text-[clamp(80px,18vw,270px)] before:font-extrabold before:leading-[0.8] before:tracking-[-0.05em] before:whitespace-nowrap before:text-white/7 before:select-none before:content-[attr(data-mark)]"
          aria-hidden="true"
          data-mark={brand.name}
        />
      </Container>
    </footer>
  );
}
