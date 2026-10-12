"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { backend } from "@/lib/admin/backend";
import { warmUp } from "@/lib/admin/cache";
import type { StaffUser } from "@/lib/admin/types";
import type { AdminRecord } from "@/lib/types";

export type AuthState =
  | { status: "loading" }
  | { status: "out" }
  | { status: "unauthorized"; user: StaffUser }
  | { status: "ready"; user: StaffUser; record: AdminRecord };

const Ctx = createContext<AuthState>({ status: "loading" });
const ROLES = ["administrator", "editor", "contributor"];

/** Tracks who is signed in and whether they have an admins/{uid} record. Signed in without a record means no access. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  useEffect(
    () =>
      backend.subscribe(async (user) => {
        if (!user) return setState({ status: "out" });
        setState({ status: "loading" });
        try {
          const record = await backend.getAdminRecord(user.uid);
          if (record && ROLES.includes(record.role)) { setState({ status: "ready", user, record }); warmUp(backend); }
          else setState({ status: "unauthorized", user });
        } catch {
          setState({ status: "unauthorized", user });
        }
      }),
    [],
  );
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

/** For screens rendered inside the guarded panel, where the state is always "ready". */
export function useStaff() {
  const s = useContext(Ctx);
  if (s.status !== "ready") throw new Error("useStaff used outside the signed-in panel");
  return s;
}
