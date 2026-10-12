# Security checklist (manual)

These checks are for you to run by hand in the Firebase console. They were not run against the emulator, and nothing here changes your data.

Where: Firebase console > Build > Firestore Database > **Rules** tab > **Rules playground**. Each check says the simulation type (get, list, create, update, delete), the document path, whether to tick "Authenticated", and the result to expect. Tick "Authenticated" and type a **Firebase UID** only where it says so.

## 0. Make sure the deployed rules are the ones in this repo

1. Open the Rules tab and compare the text with `firestore.rules`. They must be identical.
2. If they differ, deploy: `npx firebase-tools deploy --only firestore:rules --project <your-project-id>`, then reload the Rules tab and compare again.

## 1. The public can read only published content

Create two documents with the admin first: one published news post and one draft news post. Note their ids (the address of each is `/news/<id>`).

| # | Simulation | Path | Authenticated | Expected |
| --- | --- | --- | --- | --- |
| 1.1 | get | `/news/<published id>` | off | **Allowed** |
| 1.2 | get | `/news/<draft id>` | off | **Denied** |
| 1.3 | get | `/settings/site` | off | **Allowed** (by design: navigation, footer and SEO text; make sure it holds nothing private) |
| 1.4 | get | `/admins/<any uid>` | off | **Denied** |
| 1.5 | get | `/submissions/<any id>` | off | **Denied** |
| 1.6 | get | `/donations/<any id>` | off | **Denied** |

Repeat 1.1 and 1.2 for `pages`, `programmes`, `stories`, `events`, `reports`, `team` and `partners` (one published and one draft each). The site's own queries filter on `status == "published"`; the rules above are what stop anyone else from asking for drafts.

Then open the public site in a private window, view page source, and search for the title of the draft. It must not appear.

## 2. The public cannot write anywhere

With "Authenticated" **off**, run create, update and delete (one create, one update and one delete on each path) on:

`/news/x`, `/pages/home`, `/programmes/x`, `/settings/site`, `/admins/x`, `/donations/x`

Expected: **Denied** every time.

The one intended exception is the contact form inbox (`submissions`):

| # | Simulation | Path | Data | Expected |
| --- | --- | --- | --- | --- |
| 2.1 | create | `/submissions/t1` | exactly the keys `type`, `name`, `email`, `phone`, `message`, `createdAt`, `handled`, with `handled` set to `false` | **Allowed** |
| 2.2 | create | `/submissions/t2` | the same plus any extra key such as `foo` | **Denied** |
| 2.3 | create | `/submissions/t3` | the same but `handled` set to `true` | **Denied** |
| 2.4 | update or delete | `/submissions/t1` | any | **Denied** |

If the contact forms are not live yet, you can close even this: in `firestore.rules`, change the `allow create` line under `match /submissions/{id}` to `allow create: if false;` and redeploy.

## 3. Only the admin roles can write content

In Authentication > Users, pick (or create) four test people and note their UIDs. In Firestore, add a document in `admins` for three of them, named with the UID, with a `role` field set to `administrator`, `editor` and `contributor`. The fourth has no `admins` document.

Rules playground, "Authenticated" **on**, using each UID:

| # | Person | Simulation and path | Data `status` | Expected |
| --- | --- | --- | --- | --- |
| 3.1 | editor | create `/news/x` | `published` | **Allowed** |
| 3.2 | editor | update and delete `/news/x` | any | **Allowed** |
| 3.3 | editor | update `/settings/site` | n/a | **Allowed** |
| 3.4 | contributor | create `/news/y` | `draft` | **Allowed** |
| 3.5 | contributor | create `/news/y` | `published` | **Denied** |
| 3.6 | contributor | update or delete a document that is already published | any | **Denied** |
| 3.7 | contributor | update `/settings/site` | n/a | **Denied** |
| 3.8 | no `admins` document | create or update `/news/z` | `draft` | **Denied** |
| 3.9 | no `admins` document | get a draft news post | n/a | **Denied** |
| 3.10 | editor | create `/admins/<any uid>` | n/a | **Denied** |
| 3.11 | administrator | create `/admins/<any uid>` | n/a | **Allowed** |

Also check in Authentication > Settings that you have not enabled public sign-up paths you do not use (for example anonymous sign-in), because anyone who can sign in but has no `admins` document gets read access to published content only.

## 4. Donations are not client-writable

| # | Person | Simulation and path | Expected |
| --- | --- | --- | --- |
| 4.1 | not authenticated | create, update, delete `/donations/d1` | **Denied** |
| 4.2 | administrator | create, update, delete `/donations/d1` | **Denied** (even for the administrator; only the server writes them) |
| 4.3 | contributor | get `/donations/d1` | **Denied** |
| 4.4 | editor | get `/donations/d1` | **Allowed** |

Then confirm no browser code writes donations. In the project folder run:

    grep -rn "donations" app components lib --include=*.ts --include=*.tsx | grep -v "app/admin" | grep -v "components/admin"

Expected: no line that calls `setDoc`, `addDoc`, `updateDoc` or `deleteDoc` on `donations`. (The admin screens only read.)

## 5. `.env.local` is not in git

In the project folder:

1. `git check-ignore -v .env.local` should print a line that names `.gitignore` and the pattern `.env*`. No output means it is NOT ignored: stop and fix `.gitignore` first.
2. `git ls-files | grep -i "^\.env"` should print only `.env.example`.
3. `git log --all --full-history -- .env.local` should print nothing. If it prints commits, the file was committed once: rotate every secret in it (Cloudinary API secret, Fapshi keys, any service account) and rewrite history or make the repository private.
4. `git status --short` must not list `.env.local`.
5. Search history for secrets that must never be public: `git log --all -p -S"CLOUDINARY_API_SECRET" -- . ":!package-lock.json" | head`. Expected: nothing except the variable *name* in `.env.example` or the README. (Firebase web API keys that start with `AIza` are public by design and are protected by the rules above.)
6. In Vercel > Project > Settings > Environment Variables, confirm the real values are set there (Production and Preview) and nowhere in the repository.

## Record

| Check | Date | Result | Notes |
| --- | --- | --- | --- |
| 0 Rules match the repo | | | |
| 1 Public reads published only | | | |
| 2 Public cannot write | | | |
| 3 Roles | | | |
| 4 Donations | | | |
| 5 `.env.local` | | | |
