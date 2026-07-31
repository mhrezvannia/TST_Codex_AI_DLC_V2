import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createCorrelationId } from "@erp/auth";
import { requireShellSession } from "../../../lib/shell-auth";
import { BookingCreateForm } from "./BookingCreateForm";

export default async function ShellBookingNewPage() {
  const headerStore = await headers();
  const shellSession = requireShellSession(
    headerStore.get("cookie"),
    "/booking/new",
    headerStore.get("x-correlation-id") ?? createCorrelationId()
  );
  if (!shellSession.ok) {
    redirect(shellSession.redirectTo);
  }

  return (
    <>
      <section className="shell-page-heading">
        <div>
          <p className="shell-eyebrow">Create draft</p>
          <h1>New booking</h1>
          <p className="shell-muted">Actor {shellSession.actorSubjectId} is applied server-side.</p>
        </div>
      </section>
      <BookingCreateForm />
    </>
  );
}
