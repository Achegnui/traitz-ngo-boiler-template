import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/admin/AuthProvider";
import { ConfirmProvider } from "@/components/admin/ConfirmDialog";
import { Toaster } from "@/components/ui/sonner";
import "./admin.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** Its own root layout: /admin is not locale-prefixed and shares nothing with the public site's chrome. */
export default function AdminRoot({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider><ConfirmProvider>{children}</ConfirmProvider></AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
