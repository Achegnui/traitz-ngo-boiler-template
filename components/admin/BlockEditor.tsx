"use client";
import { useState } from "react";
import { BLOCK_ORDER, BLOCKS, blockSummary, newBlock, type BlockType } from "@/lib/admin/specs";
import type { Raw } from "@/lib/admin/types";
import { useConfirm } from "./ConfirmDialog";
import { FieldList, type EditorCtx } from "./FieldEditor";
import { Label } from "@/components/ui/label";
import { AdminSelect } from "./AdminSelect";
import { btnSecondary, btnSmall } from "./ui";

/** The page builder: an ordered list of blocks. Reorder with Up/Down (works with keyboard and screen readers). */
export function BlockEditor({ blocks, onChange, ctx }: { blocks: Raw[]; onChange: (b: Raw[]) => void; ctx: EditorCtx }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState<BlockType | "">("");
  const confirm = useConfirm();
  const move = (i: number, d: number) => { const n = [...blocks]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
  const toggle = (id: string, v: boolean) => setOpen((o) => ({ ...o, [id]: v }));

  function add() {
    if (!adding) return;
    const b = newBlock(adding);
    onChange([...blocks, b]);
    toggle(b.id, true);
    setAdding("");
  }

  return (
    <section aria-labelledby="blocks-h">
      <h2 id="blocks-h" className="mb-1 text-lg font-bold">Page sections</h2>
      <p className="mb-4 text-sm text-slate-600">Sections appear on the page in this order. Open a section to edit it.</p>
      <ol className="space-y-3">
        {blocks.map((b, i) => {
          const spec = BLOCKS[b.type as BlockType];
          const hasErr = Object.keys(ctx.errors).some((k) => k === `blocks.${i}` || k.startsWith(`blocks.${i}.`));
          const isOpen = open[b.id] ?? hasErr;
          const summary = blockSummary(b);
          return (
            <li key={b.id} className={`rounded-lg bg-white shadow-sm ring-1 ${hasErr ? "ring-red-300" : "ring-slate-200"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <button type="button" aria-expanded={isOpen} aria-controls={`block-${b.id}`} onClick={() => toggle(b.id, !isOpen)} className="min-w-0 flex-1 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{i + 1}. {spec?.label ?? `Unknown section (${b.type})`}</span>
                  {summary && <span className="block truncate text-sm font-medium text-slate-900">{summary}</span>}
                  {hasErr && <span className="block text-xs font-semibold text-red-700">Needs attention</span>}
                </button>
                <span className="flex gap-1">
                  <button type="button" className={btnSmall} disabled={ctx.disabled || i === 0} onClick={() => move(i, -1)} aria-label={`Move section ${i + 1} up`}>Up</button>
                  <button type="button" className={btnSmall} disabled={ctx.disabled || i === blocks.length - 1} onClick={() => move(i, 1)} aria-label={`Move section ${i + 1} down`}>Down</button>
                  <button type="button" className={btnSmall} disabled={ctx.disabled}
                    onClick={async () => { if (await confirm({ title: `Remove section ${i + 1}?`, message: `“${spec?.label ?? b.type}” will be taken off this page when you save.`, confirmLabel: "Remove" })) onChange(blocks.filter((_, j) => j !== i)); }} aria-label={`Remove section ${i + 1}`}>Remove</button>
                </span>
              </div>
              {isOpen && (
                <div id={`block-${b.id}`} className="border-t border-slate-100 px-4 py-5">
                  {spec ? (
                    <>
                      <p className="mb-4 text-sm text-slate-500">{spec.help}</p>
                      <FieldList fields={spec.fields} value={b} onChange={(nb) => onChange(blocks.map((x, j) => (j === i ? nb : x)))} path={`blocks.${i}`} ctx={ctx} />
                    </>
                  ) : <p className="text-sm text-red-700">This section type is not recognised, so it is not shown on the website. Remove it.</p>}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {ctx.errors.blocks && <p className="mt-2 text-sm font-medium text-red-700">{ctx.errors.blocks}</p>}
      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <div className="min-w-56 flex-1">
          <Label htmlFor="add-block" className="mb-1 block text-sm leading-5 font-semibold">Add a section</Label>
          <AdminSelect id="add-block" value={adding} onChange={(v) => setAdding(v as BlockType | "")} placeholder="Choose a type…" disabled={ctx.disabled} options={BLOCK_ORDER.map((t) => ({ value: t, label: BLOCKS[t].label }))} />
        </div>
        <button type="button" className={btnSecondary} disabled={!adding || ctx.disabled} onClick={add}>Add section</button>
      </div>
    </section>
  );
}
