import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createCorrelationId } from "@erp/auth";
import { loadShellBooking } from "../../../lib/booking-client";
import { requireShellSession } from "../../../lib/shell-auth";
import { AccessDeniedPanel } from "../../AccessDeniedPanel";
import { ShellFrame } from "../../ShellFrame";
import { BookingActions } from "./BookingActions";

export default async function ShellBookingDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ bookingId }, query, headerStore] = await Promise.all([params, searchParams, headers()]);
  const cookieHeader = headerStore.get("cookie");
  const correlationId = headerStore.get("x-correlation-id") ?? createCorrelationId();
  const shellSession = requireShellSession(cookieHeader, `/booking/${bookingId}`, correlationId);
  if (!shellSession.ok) {
    redirect(shellSession.redirectTo);
  }

  const result = await loadShellBooking(bookingId, cookieHeader ?? "", shellSession.summary.correlationId ?? correlationId);
  if (!result.ok && result.status === 404) {
    notFound();
  }

  return (
    <ShellFrame activePath="booking" breadcrumbs={["Shell", "Booking", bookingId]} session={shellSession.summary}>
      {!result.ok && result.status === 403 ? (
        <AccessDeniedPanel
          action="read"
          correlationId={result.correlationId}
          message={result.message}
          resource="booking"
          session={shellSession.summary}
        />
      ) : !result.ok ? (
        <section className="shell-state shell-error" data-testid="shell-booking-detail-error">
          <h1>Booking unavailable</h1>
          <p>{result.message}</p>
          <p className="shell-muted">Correlation {result.correlationId}</p>
        </section>
      ) : (
        <>
          {query.created === "1" && <p className="shell-state" role="status">Booking created</p>}
          <section className="shell-page-heading">
            <div>
              <p className="shell-eyebrow">{result.value.status}</p>
              <h1>{result.value.bookingNumber}</h1>
              <p className="shell-muted">Customer {result.value.customerId}</p>
            </div>
            <span className="shell-status">{result.value.status}</span>
          </section>
          <section className="shell-booking-workspace" data-testid="shell-booking-detail">
            <div className="shell-booking-facts">
            <article className="shell-panel">
              <h2>Route</h2>
              {result.value.routing.map((leg, index) => <p key={`${leg.loadUnLocode}-${index}`}>{leg.loadUnLocode} to {leg.dischargeUnLocode}</p>)}
            </article>
            <article className="shell-panel">
              <h2>Equipment</h2>
              {result.value.equipment.map((item) => <p key={item.equipmentId}>{item.equipmentId}<br /><span className="shell-muted">{item.equipmentTypeCode}, quantity {item.quantity}</span></p>)}
            </article>
            </div>
            <aside className="shell-booking-summary">
              <p className="shell-summary-label">Booking summary</p>
              <strong>{result.value.bookingNumber}</strong>
              <dl>
                <div><dt>Customer</dt><dd>{result.value.customerId}</dd></div>
                <div><dt>Status</dt><dd>{result.value.status}</dd></div>
                <div><dt>Equipment</dt><dd>{result.value.equipment.length}</dd></div>
              </dl>
              <div className="shell-summary-trace">
                <span>Correlation</span>
                <code>{result.correlationId}</code>
              </div>
            </aside>
            <article className="shell-panel shell-trace-panel">
              <h2>Trace</h2>
              <p>{result.correlationId}</p>
            </article>
          </section>
          <BookingActions bookingId={result.value.id} status={result.value.status} />
        </>
      )}
    </ShellFrame>
  );
}
