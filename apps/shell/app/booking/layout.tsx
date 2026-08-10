import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createCorrelationId } from "@erp/auth";
import { requireShellSession } from "../../lib/shell-auth";
import { ShellFrame } from "../ShellFrame";

export default async function BookingLayout({ children }: { children: ReactNode }) {
  const headerStore = await headers();
  const shellSession = requireShellSession(
    headerStore.get("cookie"),
    "/booking",
    headerStore.get("x-correlation-id") ?? createCorrelationId()
  );
  if (!shellSession.ok) redirect(shellSession.redirectTo);

  return (
    <ShellFrame activePath="booking" breadcrumbs={["Shell", "Booking"]} session={shellSession.summary}>
      {children}
    </ShellFrame>
  );
}
