"use client";
import type { ComponentProps } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fieldCls } from "./ui";

const NONE = "__none__";
type Option = { value: string; label: string };

/** Admin wrapper around the shadcn Select. Radix reserves "" for "nothing chosen", so a real "None" choice travels as a sentinel. */
export function AdminSelect({ value, onChange, options, placeholder, noneLabel, className, ...rest }: {
  value: string; onChange: (v: string) => void; options: Option[]; placeholder?: string; noneLabel?: string; className?: string;
} & Omit<ComponentProps<typeof SelectTrigger>, "value" | "onChange" | "children">) {
  return (
    <Select value={value === "" && noneLabel ? NONE : value} onValueChange={(v) => onChange(v === NONE ? "" : v)} disabled={rest.disabled}>
      <SelectTrigger {...rest} className={cn(fieldCls, "w-full data-[size=default]:h-auto", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {noneLabel && <SelectItem value={NONE}>{noneLabel}</SelectItem>}
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
