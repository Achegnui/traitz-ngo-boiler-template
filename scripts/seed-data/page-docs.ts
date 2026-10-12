import type { SeedDoc } from "./index";
import { extraPages } from "./pages";

// pages.ts holds typed PageDoc objects; they are stored under their slug.
export const pageDocs: SeedDoc[] = extraPages.map(({ slug, ...rest }) => ({
  collection: "pages", id: slug, data: JSON.parse(JSON.stringify({ slug, ...rest })),
}));
