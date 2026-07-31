import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createCorrelationId } from "@erp/auth";
import { Button, EmptyState, Field, Input, Select, StatusBadge, StatusStrip, Table, TableContainer } from "@erp/ui";
import { loadShellBookings } from "../../lib/booking-client";
import { requireShellSession } from "../../lib/shell-auth";
import { AccessDeniedPanel } from "../AccessDeniedPanel";
import { normalizeBookingList } from "./booking-presentation";

type Search = { page?: string; pageSize?: string; sort?: string; direction?: string; status?: string; q?: string };

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
  if (params.sort) query.set("sort", params.sort);
  if (params.direction) query.set("direction", params.direction);
  const bookings = await loadShellBookings(query, cookieHeader ?? "", shellSession.summary.correlationId ?? correlationId);
  const presentation = normalizeBookingList(bookings);

  return (
    <>
      <section className="shell-page-heading">
        <div>
          <p className="shell-eyebrow">Operations queue</p>
          <h1>Booking</h1>
          <p className="shell-muted">Mounted Booking workspace using actor {shellSession.actorSubjectId}.</p>
        </div>
        <a className="erp-btn erp-btn--primary" href="/booking/new" data-testid="shell-new-booking">New booking</a>
      </section>
      <form className="shell-booking-filters" method="get" aria-label="Booking filters">
        <Field label="Search" htmlFor="booking-search">
          <Input id="booking-search" name="q" defaultValue={params.q ?? ""} type="search" />
        </Field>
        <Field label="Status" htmlFor="booking-status">
          <Select id="booking-status" name="status" defaultValue={params.status ?? ""}>
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option><option value="VALIDATED">Validated</option>
            <option value="PRICED">Priced</option><option value="CONFIRMED">Confirmed</option><option value="EXCEPTION">Exception</option>
          </Select>
        </Field>
        <input type="hidden" name="pageSize" value="25" />
        {params.sort ? <input type="hidden" name="sort" value={params.sort} /> : null}
        {params.direction ? <input type="hidden" name="direction" value={params.direction} /> : null}
        <Button type="submit" variant="primary" data-testid="booking-filter-apply">Apply filters</Button>
        <a className="erp-btn" href="/booking">Clear</a>
      </form>
      {presentation.state === "denied" ? (
        <AccessDeniedPanel
          action="read"
          correlationId={presentation.correlationId}
          message={presentation.message}
          resource="booking"
          session={shellSession.summary}
        />
      ) : presentation.state === "error" ? (
        <StatusStrip tone="danger" role="alert" data-state="error" data-testid="shell-booking-error">
          <h2>Bookings unavailable</h2>
          <p>{presentation.message}</p>
          <p className="shell-muted">Correlation {presentation.correlationId}</p>
          <a href={`/booking?${new URLSearchParams(params as Record<string, string>).toString()}`}>Retry</a>
        </StatusStrip>
      ) : presentation.state === "empty" ? (
        <EmptyState title="No bookings found" role="status" data-state="empty" data-testid="shell-booking-empty">
          <p>Change the current filters or create a draft booking.</p>
          <a href="/booking/new">Create booking</a>
        </EmptyState>
      ) : (
        <>
          {presentation.state === "degraded" ? <StatusStrip tone="warning" role="status" data-state="degraded">{presentation.message}</StatusStrip> : null}
          <p className="shell-muted" role="status">{presentation.items.length} bookings shown</p>
          <TableContainer data-testid="shell-booking-list" data-state={presentation.state}>
          <Table aria-label="Bookings">
            <thead>
              <tr><th>Booking</th><th>Customer</th><th>Route</th><th>Status</th></tr>
            </thead>
            <tbody>
              {presentation.items.map((booking) => (
                <tr key={booking.id}>
                  <td><a href={`/booking/${booking.id}`}>{booking.bookingNumber}</a></td>
                  <td>{booking.customerId}</td>
                  <td>{booking.routing[0] ? `${booking.routing[0].loadUnLocode} to ${booking.routing[0].dischargeUnLocode}` : "Correction required"}</td>
                  <td><StatusBadge status={booking.status} /></td>
                </tr>
              ))}
            </tbody>
          </Table>
          </TableContainer>
        </>
      )}
    </>
  );
}
