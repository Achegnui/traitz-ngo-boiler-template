# shadcn/ui sync notes

Imports use the individual `@radix-ui/react-*` packages, not the unified `radix-ui` package: the unified barrel added roughly 90 kB of first-load JS on pages that use one component. If `npx shadcn@latest add` writes `from "radix-ui"`, change it to the matching `@radix-ui/react-<name>` import.

The shadcn registry was not reachable from the build environment, so every file below was written by hand in the
canonical new-york form (unified `radix-ui` package, `data-slot` attributes, Tailwind v4, no `dark:` variants).
To compare against the registry, run locally:

    npx shadcn@latest add <name> --overwrite
    git diff components/ui/<name>.tsx

| File | Status | Notes |
| --- | --- | --- |
| components/ui/button.tsx | CUSTOMISED (includes disabled styling) | Brand geometry: full pill, variants default (amber), dark, outline, ghost (on dark), destructive; optional trailing arrow in a 30px circle (`arrow` prop, works with `asChild` via Slottable). Do not overwrite blindly. |
| components/ui/sheet.tsx | hand-written, small additions | Adds `overlayClassName`, `showCloseButton` and `animated` props on SheetContent (MobileNav turns `animated` off and uses the original 0.22s slide-in). |
| components/ui/sonner.tsx | hand-written, changed | `next-themes` removed, theme fixed to light. |
| components/ui/input.tsx | hand-written | stock minus `dark:` classes |
| components/ui/textarea.tsx | hand-written | stock minus `dark:` classes |
| components/ui/label.tsx | hand-written | stock |
| components/ui/select.tsx | hand-written | stock minus `dark:` classes |
| components/ui/badge.tsx | hand-written | stock minus `dark:` classes |
| components/ui/card.tsx | hand-written | stock |
| components/ui/separator.tsx | hand-written | stock |
| components/ui/alert-dialog.tsx | hand-written, changed | `overlayClassName` and `animated` props on the content. Action and Cancel use the brand `buttonVariants` unless a `className` is passed (the admin passes its own button look). |
| components/ui/tabs.tsx | hand-written | stock minus `dark:` classes |
| components/ui/accordion.tsx | hand-written, changed | `chevron` prop on the trigger (the FAQ draws its own +/- marker), the open/close height animation removed so the FAQ keeps its original instant toggle, and closed content hidden by `data-[state=closed]:hidden` so the FAQ can use `forceMount` and keep its answers in the server HTML. |
| components/ui/table.tsx | hand-written | stock |
| lib/utils.ts | hand-written | stock `cn` |

Semantic variables (`--background`, `--primary`, `--accent`, `--ring`, `--border` ...) are mapped onto the brand tokens in `app/globals.css`.

Not added: `skeleton` (written in Batch A, deleted in Batch C because nothing uses it). Add it with `npx shadcn@latest add skeleton` when needed.
The admin has its own look: `app/admin/admin.css` maps the semantic variables onto slate and amber. Both stylesheets share `app/shadcn-map.css`.
