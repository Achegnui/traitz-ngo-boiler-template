import { cn } from "@/lib/utils";

/** Page-width wrapper: 1200px max, 24px gutters (16px on narrow phones). */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto max-w-[1200px] px-6 max-[480px]:px-4", className)} {...props} />;
}

/** Vertical rhythm for page sections. `tone="alt"` is the tinted band; a PageHeader turns the band after it white. */
export function Section({
  as: Comp = "section",
  tone = "default",
  tight = false,
  className,
  ...props
}: React.ComponentProps<"section"> & { as?: "section" | "article"; tone?: "default" | "alt"; tight?: boolean }) {
  return (
    <Comp
      data-tone={tone === "alt" ? "alt" : undefined}
      className={cn("overflow-x-clip", tight ? "py-16" : "py-24", "max-[700px]:py-14", tone === "alt" && "bg-brand-tint", className)}
      {...props}
    />
  );
}
