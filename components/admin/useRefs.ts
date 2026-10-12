"use client";
import { useEffect, useState } from "react";
import { backend } from "@/lib/admin/backend";
import type { Raw } from "@/lib/admin/types";
import type { RefOption } from "./FieldEditor";

/** Options for "choose a programme / story" fields. Drafts are listed but marked, since they will not show on the site. */
export function useRefs(): Record<string, RefOption[]> {
  const [refs, setRefs] = useState<Record<string, RefOption[]>>({});
  useEffect(() => {
    let live = true;
    (async () => {
      const out: Record<string, RefOption[]> = {};
      for (const c of ["programmes", "stories"]) {
        try {
          const docs: Raw[] = await backend.list(c);
          out[c] = docs.map((d) => ({ id: d.id, label: `${d.title?.en || d.id}${d.status === "published" ? "" : " (draft)"}` }));
        } catch { out[c] = []; }
      }
      if (live) setRefs(out);
    })();
    return () => { live = false; };
  }, []);
  return refs;
}
