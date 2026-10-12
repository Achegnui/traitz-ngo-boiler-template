import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type Props = Omit<ComponentProps<"a">, "href" | "ref"> & { href: string };

/** Internal paths ("/about") get locale-aware routing; anything else is a plain anchor. */
export function AppLink({ href, ...rest }: Props) {
  if (href.startsWith("/")) return <Link href={href} {...rest} />;
  return <a href={href} {...rest} />;
}
