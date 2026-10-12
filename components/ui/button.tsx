import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* CUSTOMISED (not stock shadcn): pill geometry and variants from the brand spec. See SHADCN-SYNC.md. */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center gap-3 rounded-full border border-transparent text-[15px] font-semibold [transition:transform_.18s_ease-out,background_.18s_ease-out] hover:[transform:scale(1.03)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:[transform:none]",
  {
    variants: {
      variant: {
        default: "bg-primary py-2 pr-2 pl-[22px] text-primary-foreground hover:brightness-[1.08]",
        dark: "bg-brand-anchor py-2 pr-2 pl-[22px] text-white",
        destructive: "bg-destructive py-2 pr-2 pl-[22px] text-white",
        outline: "border-brand-ink bg-transparent px-[22px] py-[11px] text-brand-ink",
        ghost: "border-white/50 bg-transparent px-[22px] py-[11px] text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const arrowVariants = cva("grid size-[30px] place-items-center rounded-full", {
  variants: {
    variant: {
      default: "bg-brand-anchor/12",
      dark: "bg-white/18",
      destructive: "bg-white/18",
      outline: "bg-brand-anchor/12",
      ghost: "bg-white/18",
    },
  },
  defaultVariants: { variant: "default" },
});

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; arrow?: boolean; arrowClassName?: string };

function Button({ className, variant, asChild = false, arrow = false, arrowClassName, children, ...props }: ButtonProps) {
  const cls = cn(buttonVariants({ variant }), className);
  const arrowEl = arrow ? (
    <span aria-hidden="true" data-slot="button-arrow" className={cn(arrowVariants({ variant }), arrowClassName)}>→</span>
  ) : null;
  if (asChild) {
    return (
      <Slot data-slot="button" className={cls} {...props}>
        <Slottable>{children}</Slottable>
        {arrowEl}
      </Slot>
    );
  }
  return (
    <button data-slot="button" className={cls} {...props}>
      {children}
      {arrowEl}
    </button>
  );
}

export { Button, buttonVariants };
