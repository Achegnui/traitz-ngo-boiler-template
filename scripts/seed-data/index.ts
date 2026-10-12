import { events } from "./events";
import { home } from "./home";
import { news } from "./news";
import { pageDocs } from "./page-docs";
import { partners } from "./partners";
import { programmes } from "./programmes";
import { reports } from "./reports";
import { site } from "./site";
import { stories } from "./stories";
import { team } from "./team";

export type SeedDoc = { collection: string; id: string; data: Record<string, unknown> };

/** Drop `id` (it is the Firestore document id) and anything undefined / non-JSON, exactly as Firestore would store it. */
const clean = (v: unknown) => JSON.parse(JSON.stringify(v)) as Record<string, unknown>;
const fromList = (collection: string, list: { id: string }[]): SeedDoc[] =>
  list.map(({ id, ...rest }) => ({ collection, id, data: clean(rest) }));

/**
 * The complete demo dataset (spec section 13), one entry per Firestore document.
 * Used by `npm run seed`, and by DATA_SOURCE=local so the app can run offline with identical data.
 */
export const seedDocs: SeedDoc[] = [
  { collection: "pages", id: "home", data: clean(home) },
  ...pageDocs,
  { collection: "settings", id: "site", data: clean(site) },
  ...fromList("programmes", programmes),
  ...fromList("stories", stories),
  ...fromList("news", news),
  ...fromList("team", team),
  ...fromList("partners", partners),
  ...fromList("events", events),
  ...fromList("reports", reports),
];
