import Image from "next/image";
import { Fragment } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { AppLink } from "@/components/ui/AppLink";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Section";
import { Separator } from "@/components/ui/separator";
import { btnRow, fadeUp, monoLabel, slideIn } from "@/components/ui/typography";
import { localize } from "@/lib/i18n";
import type { HeroBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

/** "\n" becomes <br>; hyphenated words (Nord-Ouest) never break at the hyphen. */
const words = (l: string) => l.split(/( )/).map((w, i) => (w.includes("-") ? <span key={i} className="whitespace-nowrap">{w}</span> : w));
const lines = (s: string) => s.split("\n").map((l, i, a) => <Fragment key={i}>{words(l)}{i < a.length - 1 && <br />}</Fragment>);

function Headline({ text, accent }: { text: string; accent: string }) {
  const i = accent ? text.indexOf(accent) : -1;
  if (i < 0) return <>{lines(text)}</>;
  return (
    <>
      {lines(text.slice(0, i))}
      <span className="text-brand-accent">{lines(accent)}</span>
      {lines(text.slice(i + accent.length))}
    </>
  );
}

export function Hero({ block, locale }: BlockProps<HeroBlock>) {
  const { card, image, ctaPrimary, ctaSecondary } = block;
  const small = card ? "text-[14px]" : "";
  const buttons = (
    <div className={btnRow}>
      <Button asChild arrow className={small}><AppLink href={ctaPrimary.href}>{localize(ctaPrimary.label, locale)}</AppLink></Button>
      {ctaSecondary && <Button asChild variant="ghost" className={cn(small, card && "px-[18px]")}><AppLink href={ctaSecondary.href}>{localize(ctaSecondary.label, locale)}</AppLink></Button>}
    </div>
  );
  return (
    <section className="grain contour-mask-light relative flex min-h-[calc(100svh-72px)] items-end overflow-hidden bg-brand-anchor text-white">
      <div className="hero-sky absolute inset-0 animate-zoom" aria-hidden="true">
        {image.url && <Image src={image.url} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />}
      </div>
      {block.liveTag && (
        <span className={cn(monoLabel, "absolute top-6 right-6 z-3 flex items-center gap-2 rounded-full border border-white/35 bg-brand-anchor/50 px-3.5 py-2 before:size-2 before:rounded-full before:bg-brand-accent before:content-['']")}>
          {localize(block.liveTag, locale)}
        </span>
      )}
      <Container className="relative z-3 my-auto grid grid-cols-[1.45fr_1fr] items-end gap-10 pt-[120px] pb-16 max-[860px]:grid-cols-1 max-[860px]:pt-24 max-[860px]:pb-10">
        <div>
          <h1 className={cn(slideIn, "text-[clamp(40px,5.4vw,72px)] font-extrabold max-[480px]:text-[9vw]")} style={{ animationDelay: ".1s" }}>
            <Headline text={localize(block.headline, locale)} accent={localize(block.accentWord, locale)} />
          </h1>
          <p className={cn(fadeUp, "mt-6 max-w-[520px] text-[19px] text-white/90")} style={{ animationDelay: ".5s" }}>{localize(block.sub, locale)}</p>
          {!card && buttons}
        </div>
        {card && (
          <div className={cn(fadeUp, "rounded-2xl border border-white/14 bg-brand-anchor/72 p-6 backdrop-blur-[14px]")} style={{ animationDelay: ".9s" }}>
            <p className="text-[16px] text-white/85">{localize(card.text, locale)}</p>
            <Separator className="my-[18px] bg-white/18" />
            <div className="grid grid-cols-2 gap-4">
              {card.stats.map((s) => (
                <div key={s.label.en}>
                  <div className="font-display text-[40px] font-extrabold leading-[normal] text-brand-accent"><CountUp value={s.value} locale={locale} prefix={s.prefix} suffix={s.suffix} /></div>
                  <div className="text-[13px] text-white/72">{localize(s.label, locale)}</div>
                </div>
              ))}
            </div>
            {buttons}
          </div>
        )}
      </Container>
    </section>
  );
}
