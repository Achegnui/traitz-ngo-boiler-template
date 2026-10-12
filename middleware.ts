import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// /admin (Phase 3) and /api are intentionally not locale-prefixed.
export const config = { matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)" };
