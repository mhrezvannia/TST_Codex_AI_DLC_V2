import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createCorrelationId } from "@erp/auth";
import { requireShellSession } from "../lib/shell-auth";
import { ShellFrame } from "./ShellFrame";

export default async function ShellHomePage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie");
  const shellSession = requireShellSession(cookieHeader, "/", headerStore.get("x-correlation-id") ?? createCorrelationId());
  if (!shellSession.ok) {
    redirect(shellSession.redirectTo);
  }

  return (
    <ShellFrame activePath="home" breadcrumbs={["Shell", "Overview"]} session={shellSession.summary}>
      <section className="shell-page-heading">
        <div>
          <p className="shell-eyebrow">Authenticated workspace</p>
          <h1>Application shell</h1>
          <p className="shell-muted">Booking is mounted as the first W2-01 business module.</p>
        </div>
      </section>
      <section className="shell-grid" aria-label="Shell status">
        <article className="shell-panel">
          <h2>Session</h2>
          <p>{shellSession.summary.subject}</p>
          <p className="shell-muted">{shellSession.summary.permissionSummary?.total ?? 0} permissions summarized</p>
        </article>
        <article className="shell-panel">
          <h2>Mounted module</h2>
          <p><a href="/booking" data-testid="shell-open-booking">Open Booking</a></p>
          <p className="shell-muted">Read-only walking skeleton path.</p>
        </article>
        <article className="shell-panel">
          <h2>Trace</h2>
          <p>{shellSession.summary.correlationId}</p>
          <p className="shell-muted">Correlation id is propagated server-side.</p>
        </article>
      </section>
    </ShellFrame>
  );
}
