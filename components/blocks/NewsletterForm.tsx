"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Phase 5 replaces this handler with React Hook Form + Zod + a server action.
export function NewsletterForm({ placeholder, button }: { placeholder: string; button: string }) {
  return (
    <form className="flex flex-wrap gap-2" onSubmit={(e) => e.preventDefault()}>
      <Label htmlFor="nl-email" className="sr-only">{placeholder}</Label>
      <Input
        id="nl-email" type="email" required placeholder={placeholder}
        className="h-auto w-auto min-w-[260px] rounded-full border-0 px-5 py-3.5 text-[17px] leading-[1.6] shadow-none placeholder:text-brand-anchor/50 focus-visible:ring-0 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand-accent md:text-[17px]"
      />
      <Button type="submit" variant="dark" arrow>{button}</Button>
    </form>
  );
}
