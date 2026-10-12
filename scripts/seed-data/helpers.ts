import { L, type Localized } from "@/lib/i18n";
import type { Cta } from "@/lib/types";

export { L };
export const cta = (label: Localized, href: string): Cta => ({ label, href });
