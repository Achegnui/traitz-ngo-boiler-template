# Traitz NGO Boilerplate (Phases 1-3: frontend, Firestore, admin)

    npm install
    npm run dev      # http://localhost:3000 redirects to /en
    npm run typecheck

## Firebase (Phase 2)

Setup: copy `.env.example` to `.env.local` and fill in the six `NEXT_PUBLIC_FIREBASE_*` values (`.env*` is git-ignored).

    npm install
    npm run seed:dry        # validates the 24 demo documents, no network
    npm run seed            # writes them (refuses if pages/home exists; --force overwrites)
    npm run check:firebase  # reads them back the way the site does
    npm run dev             # edits in the console show on refresh
    npm run build && npm start   # production: edits go live within 30 s (see below)

Collections: `pages/{slug}` (block array, spec 4.1), `settings/site` (nav, footer, route SEO), `programmes`, `stories`, `news`, `team`, `partners`. Dates are ISO strings. The seed data lives in `scripts/seed-data/` and is the only place demo copy exists.

Reads go through `lib/data.ts` -> `lib/source.ts` -> `lib/firebase.ts` (the only Firebase init). Routes set `export const revalidate = 30`: after you edit a document, the first visit after 30 s serves the old page and triggers a rebuild of it, the next visit shows the change. `DATA_SOURCE=local` serves the bundled seed data without Firestore (offline dev, CI).

Security: seeding uses the web SDK, so run it while your rules still allow writes (test mode). Then deploy `firestore.rules` (`npx firebase-tools deploy --only firestore:rules --project <id>`). Test-mode rules expire after 30 days, so do this before then. Storage rules (`storage.rules`) are for Phase 3 uploads.

## Where things live

- Rebrand: `theme/brand.config.ts` (preset, colours, `fonts.display`).
- Pages are block arrays: `scripts/seed-data/home.ts` exports a `PageDoc` (same shape as a `/pages/{slug}` Firestore document). `components/BlockRenderer.tsx` maps each block `type` to a component in `components/blocks/`. Adding a `Block` type in `lib/types.ts` without a renderer fails the typecheck.
- Collections (seed data): `scripts/seed-data/programmes.ts`, `stories.ts`, `news.ts`, `team.ts`, `partners.ts`. Blocks reference them by id (`programmeRefs`, `storyRef`) or read them whole (news, partners). Funding progress is derived from `fundingRaised / fundingGoal`.
- Site-wide chrome (nav, footer, meta description): `scripts/seed-data/site.ts` -> `settings/site`.
- Data seam: every component reads through `lib/data.ts`. They read Firestore (published documents only).

## Languages

Routes are `/en/...` and `/fr/...` (next-intl). Every localisable field is `Localized = { en, fr? }` and French falls back to English when empty (`lib/i18n.ts`). Short UI strings (aria labels, "x% funded") live in `messages/*.json`. `/admin` and `/api` are excluded from locale routing in `middleware.ts`.

`app/[locale]/[...rest]` is a "coming soon" placeholder so links to unbuilt routes do not 404. Delete it as real routes land.

## Admin (Phase 3)

Open `/admin`. Staff sign in with email and password (Firebase Auth). A person is staff only if `admins/{their UID}` exists in Firestore with `role: "administrator" | "editor" | "contributor"`.

- **First administrator** (once, by hand): Firebase console > Authentication > Add user, copy the UID, then Firestore > `admins` > document ID = that UID, string fields `role` = `administrator`, `email`, `displayName`. After that, administrators add people under Users (they get an email to set their own password).
- **Roles** (enforced by `firestore.rules`): administrator = everything incl. staff; editor = create/edit/publish/delete, site settings, read messages and donations; contributor = create and edit drafts only.
- **Screens:** Dashboard, Pages (block-level builder: add, remove, reorder, edit, draft or publish; new pages appear at `/{locale}/{slug}`), Programmes, Stories, News, Events, Reports, Team, Partners, Submissions, Donations (read-only), Users, Help. Every bilingual field edits English and French together; French falls back to English when empty.
- **Validation:** `lib/schemas.ts` is used by the forms (publishing needs a complete document; drafts need only a title) and by the public site (a malformed document or block is skipped and logged, never a crash).
- **Uploads:** images and PDFs go to Cloudinary. Add `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` to `.env.local`. The browser asks `/api/cloudinary/sign` for a one-time signature; the server only grants it to signed-in staff and fixes the folder and file types.
- **Instant updates:** after a save the admin calls `/api/revalidate` so the site updates at once (otherwise within 30 s).
- **Try it without Firebase:** `NEXT_PUBLIC_ADMIN_BACKEND=fake DATA_SOURCE=local npm run dev` runs the admin against an in-memory copy of the seed data. Accounts `admin@example.test`, `editor@example.test`, `contributor@example.test`, `stranger@example.test` (not staff), password `demo-pass-1`. Production builds do not include it.
- **Publish the rules, then run these checks** in Firebase console > Firestore > Rules > Rules playground (they have not been run against an emulator):
  1. Not signed in, `get /pages/home`: allowed. A draft document: denied. `update /news/x`: denied. `get /settings/site`: allowed. `get /donations/x` and `get /submissions/x`: denied.
  2. Signed in as your administrator UID: `get /admins/<your UID>` allowed; as any other UID: denied. `update` any content document: allowed.
  3. Signed in as a contributor UID: `create /news/test` with `status: "published"` denied, with `status: "draft"` allowed; `update` a published document denied; `delete` denied.
- Editing the site menu, footer and meta description is still done in the Firebase console (`settings/site`).

## Adding the new pages to an existing Firestore

    $env:SEED_EMAIL="you@example.org"; $env:SEED_PASSWORD="your password"; npm run seed -- --missing

`--missing` only adds documents that do not exist yet. To refresh existing ones with the new look (this overwrites your edits to them): `npm run seed -- --only pages/home,programmes,stories,news,team`.

## SEO

- `lib/seo.ts` builds every page's metadata (title, description, canonical, hreflang incl. `x-default`, Open Graph, Twitter). Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) or canonicals and the sitemap point at localhost.
- Preview images are generated: `opengraph-image.tsx` for the home page and news posts, `app/[locale]/og/[...rest]/route.tsx` for placeholder pages (Next cannot serve a file-based image under a catch-all). Replace `lib/og.tsx` with the hero photo when real photography exists.
- JSON-LD: `NGO` on the home page, `Article` on `/[locale]/news/[slug]`.
- `app/sitemap.ts` lists only real pages; the coming-soon placeholders are `noindex` and left out. `app/robots.ts` disallows `/admin` and `/api/`.

## Motion

`Reveal`, `CountUp` and `ProgressBar` render fully visible on the server and only hide/animate after hydration, so no-JS and reduced-motion users see everything. They use `motion/mini` (WAAPI) plus a small IntersectionObserver helper in `lib/inview.ts`.

## Known gaps

Admin: no live preview before publishing; no drag-and-drop (Up/Down buttons instead); sign-up is open at the Firebase level (a stranger can create a login but gets no access without an `admins` record); `storage.rules` is unused while uploads go to Cloudinary.


Illustrated stand-ins instead of real photos (add photos via the admin or /public/photos), no shadcn/ui, styling is global CSS in `app/globals.css` rather than Tailwind utilities, donate form is interface only until Phase 4, no contact or volunteer forms until Phase 5, LCP not re-measured after the redesign (last measured 2.76 s on Slow 4G against a 2.5 s target).

v2 backlog: donor portals, e-commerce, native apps, migration tooling, grant/M&E dashboards, card payments, multi-tenancy.

## Styling

The site is styled with Tailwind CSS v4 utilities and shadcn/ui components. There is no dark mode and no hex colour in any component.

**How tokens flow.** `theme/brand.config.ts` holds the brand presets (anchor, accent, tint, ink, muted, fonts, name). `themeVars()` writes them as `--brand-*` variables on `<html>`. `app/globals.css` maps them to Tailwind utilities in an `@theme inline` block, so you write `bg-brand-accent`, `text-brand-ink`, `border-brand-ink/30`. The shadcn semantic variables (`--primary`, `--accent`, `--ring`, `--border` and friends) are defined in the same file and point at the brand tokens; `app/shadcn-map.css` maps them to `bg-primary`, `border-border` and the rest. Decorative backgrounds (`grain`, `contour-light`, `contour-dark`, `hero-sky`) are documented `@utility` rules at the bottom of `globals.css`.

**The admin has its own look.** `app/admin/admin.css` keeps the admin's slate and amber palette and maps the same shadcn variables onto it, so the admin does not change when you rebrand the site.

**Add a shadcn component.** `components.json` is set up (new-york style, CSS variables). Run `npx shadcn@latest add <name>`, then check the new file: remove any `dark:` classes, replace any hex colour with a token, and if it imports from `"radix-ui"` switch it to the matching `@radix-ui/react-<name>` package (the unified package adds about 90 kB to the first load). `SHADCN-SYNC.md` lists which components are customised (button, sheet, sonner, accordion, alert-dialog); diff before using `--overwrite` on those.

**Rebrand a fork.** Change the preset in `theme/brand.config.ts` (colours, name, tagline, fonts) and, for new fonts, replace the files in `app/fonts/` and the `localFont` calls in `app/[locale]/layout.tsx`. Nothing else needs to change: header, footer, buttons, cards, the hero gradient and the contour lines all derive from the tokens. To rebrand the admin too, edit the variables in `app/admin/admin.css`.

**Check that nothing moved.** Start the site (`DATA_SOURCE=local NEXT_PUBLIC_ADMIN_BACKEND=fake npm run build && npm start`), then:

    npm run shots -- baseline    # before your change
    npm run shots -- current     # after your change
    npm run shots:diff           # percent difference per image (390px and 1280px)
    npm run smoke:admin          # confirm dialog, EN/FR tabs, toast, selects

Screenshots use the Chromium bundled in `@sparticuz/chromium`, or a Playwright browser if you have one installed.
