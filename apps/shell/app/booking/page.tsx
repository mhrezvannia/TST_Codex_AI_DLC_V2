import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createCorrelationId } from "@erp/auth";
import { loadShellBookings } from "../../lib/booking-client";
import { requireShellSession } from "../../lib/shell-auth";
import { AccessDeniedPanel } from "../AccessDeniedPanel";
import { ShellFrame } from "../ShellFrame";

type Search = { page?: string; status?: string; q?: string };

export default async function ShellBookingPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [params, headerStore] = await Promise.all([searchParams, headers()]);
  const cookieHeader = headerStore.get("cookie");
  const correlationId = headerStore.get("x-correlation-id") ?? createCorrelationId();
  const shellSession = requireShellSession(cookieHeader, "/booking", correlationId);
  if (!shellSession.ok) {
    redirect(shellSession.redirectTo);
  }

  const query = new URLSearchParams({ page: params.page ?? "0", size: "25" });
  if (params.status) query.set("status", params.status);
  if (params.q) query.set("search", params.q);
  const bookings = await loadShellBookings(query, cookieHeader ?? "", shellSession.summary.correlationId ?? correlationId);

  return (
    <ShellFrame activePath="booking" breadcrumbs={["Shell", "Booking"]} session={shellSession.summary}>
      <section className="shell-page-heading">
        <div>
          <p className="shell-eyebrow">Operations queue</p>
          <h1>Booking</h1>
          <p className="shell-muted">Mounted Booking workspace using actor {shellSession.actorSubjectId}.</p>
        </div>
        <a className="shell-button shell-button-primary" href="/booking/new" data-testid="shell-new-booking">New booking</a>
      </section>
      {!bookings.ok && bookings.status === 403 ? (
        <AccessDeniedPanel
          action="read"
          correlationId={bookings.correlationId}
          message={bookings.message}
          resource="booking"
          session={shellSession.summary}
        />
      ) : !bookings.ok ? (
        <section className="shell-state shell-error" data-testid="shell-booking-error">
          <h2>Bookings unavailable</h2>
          <p>{bookings.message}</p>
          <p className="shell-muted">Correlation {bookings.correlationId}</p>
        </section>
      ) : bookings.value.items.length === 0 ? (
        <section className="shell-state" data-testid="shell-booking-empty">
          <h2>No bookings found</h2>
          <p className="shell-muted">Create and compatibility paths are implemented in later W2-01 units.</p>
        </section>
      ) : (
        <div className="shell-table-wrap" data-testid="shell-booking-list">
          <table className="shell-table">
            <thead>
              <tr><th>Booking</th><th>Customer</th><th>Route</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.value.items.map((booking) => (
                <tr key={booking.id}>
                  <td><a href={`/booking/${booking.id}`}>{booking.bookingNumber}</a></td>
                  <td>{booking.customerId}</td>
                  <td>{booking.routing[0] ? `${booking.routing[0].loadUnLocode} to ${booking.routing[0].dischargeUnLocode}` : "Correction required"}</td>
                  <td><span className="shell-status">{booking.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ShellFrame>
  );
}
