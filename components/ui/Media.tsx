import Image from "next/image";
import type { HTMLAttributes } from "react";
import type { Locale } from "@/i18n/routing";
import { ArtSvg } from "@/lib/art";
import { localize } from "@/lib/i18n";
import type { ImageRef } from "@/lib/types";
import { cn, gradVar } from "@/lib/utils";

/**
 * Real photo when `url` exists. Otherwise the illustrated stand-in (`art`), or the older gradient.
 * Empty alt marks the image as decorative. Pass `className` to change the frame (aspect, radius, margin).
 * The slow zoom runs only when an ancestor has `group/pc` (the programme card) and is hovered.
 */
export function Media({ image, locale, sizes = "(max-width: 900px) 100vw, 400px", priority = false, className }: {
  image: ImageRef; locale: Locale; sizes?: string; priority?: boolean; className?: string;
}) {
  const alt = localize(image.alt, locale);
  const a11y: HTMLAttributes<HTMLDivElement> = image.url ? {} : alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true };
  const zoom = "[transition:transform_.6s_ease] group-hover/pc:[transform:scale(1.05)]";
  return (
    <div
      className={cn("relative mb-4 aspect-[4/3] overflow-hidden rounded-[12px] [background:var(--g)]", className)}
      style={!image.url && !image.art && image.gradient ? gradVar(image.gradient) : undefined}
      {...a11y}
    >
      {image.url ? <Image className={cn("object-cover", zoom)} src={image.url} alt={alt} fill sizes={sizes} priority={priority} /> : image.art ? <ArtSvg art={image.art} className={cn("absolute inset-0 block size-full", zoom)} /> : null}
    </div>
  );
}
