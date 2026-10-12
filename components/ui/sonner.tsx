"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/* CUSTOMISED (not stock shadcn): no next-themes, because the site is light only. See SHADCN-SYNC.md. */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    style={{ "--normal-bg": "var(--popover)", "--normal-text": "var(--popover-foreground)", "--normal-border": "var(--border)" } as React.CSSProperties}
    {...props}
  />
);

export { Toaster };
