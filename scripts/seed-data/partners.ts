import type { Partner } from "@/lib/types";

const p = (id: string, name: string, order: number): Partner => ({ id, slug: id, name, order, status: "published" });

// No logoUrl yet: the block falls back to a text wordmark.
export const partners: Partner[] = [
  p("bui-council", "Bui Council", 1),
  p("helvetas-hub", "Helvetas Hub", 2),
  p("rotary-bamenda", "Rotary Bamenda", 3),
  p("mtn-foundation", "MTN Foundation", 4),
  p("nw-health-board", "NW Health Board", 5),
];
