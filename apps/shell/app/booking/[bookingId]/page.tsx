import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createCorrelationId } from "@erp/auth";
import { Card, Stack, StatusBadge, StatusStrip } from "@erp/ui";
import { loadShellBooking } from "../../../lib/booking-client";
import { requireShellSession } from "../../../lib/shell-auth";
import { AccessDeniedPanel } from "../../AccessDeniedPanel";
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
    <>
      {!result.ok && result.status === 403 ? (
        <AccessDeniedPanel
          action="read"
          correlationId={result.correlationId}
          message={result.message}
          resource="booking"
          session={shellSession.summary}
        />
      ) : !result.ok ? (
        <StatusStrip tone="danger" role="alert" data-state="error" data-testid="shell-booking-detail-error">
          <h1>Booking unavailable</h1>
          <p>{result.message}</p>
          <p className="shell-muted">Correlation {result.correlationId}</p>
        </StatusStrip>
      ) : (
        <section data-testid="booking-detail" data-state="populated" aria-live="polite">
          {query.created === "1" && <StatusStrip tone="success" role="status" data-state="success">Booking created</StatusStrip>}
          <section className="shell-page-heading">
            <div>
              <p className="shell-eyebrow">{result.value.status}</p>
              <h1>{result.value.bookingNumber}</h1>
              <p className="shell-muted">Customer {result.value.customerId}</p>
              <p className="shell-muted">Revision {result.value.revision}</p>
            </div>
            <StatusBadge status={result.value.status} />
          </section>
          {result.value.legacyIncomplete ? (
            <StatusStrip tone="danger" role="alert" data-state="validation-blocked">
              <h2>Correction required</h2>
              <p>This legacy booking is readable but needs route and equipment identity before lifecycle commands can continue.</p>
            </StatusStrip>
          ) : null}
          <Card title="Cargo setup">
            <dl>
              <div><dt>Currency / mode</dt><dd>{result.value.currency} / {result.value.cargoMode}</dd></div>
              <div><dt>Reefer</dt><dd>{result.value.reefer ? "Yes" : "No"}</dd></div>
              <div><dt>Dangerous goods</dt><dd>{result.value.dangerousGoods ? "Yes" : "No"}</dd></div>
            </dl>
          </Card>
          <Card title="Reference validation" data-testid="booking-validation-evidence">
            {result.value.referenceValidation ? (
              <>
                <p><strong>{result.value.referenceValidation.outcome}</strong> at {new Date(result.value.referenceValidation.checkedAt).toLocaleString()}</p>
                <ul>
                  {result.value.referenceValidation.fieldResults.map((field) => (
                    <li key={`${field.fieldPath}-${field.requestedValue}`}>
                      <strong>{field.fieldPath}</strong>: {field.requestedValue} — {field.outcome === "ACTIVE" ? "active reference" : field.reasonCode.toLowerCase().replaceAll("_", " ")}
                    </li>
                  ))}
                </ul>
              </>
            ) : <p className="shell-muted">Not yet verified.</p>}
          </Card>
          <section className="shell-grid shell-workbench" data-testid="shell-booking-detail">
            <Card>
              <h2>Route</h2>
              {result.value.routing.map((leg, index) => <p key={`${leg.loadUnLocode}-${index}`}>{leg.loadUnLocode} to {leg.dischargeUnLocode}</p>)}
            </Card>
            <Card>
              <h2>Equipment</h2>
              {result.value.equipment.map((item) => <p key={item.equipmentId}>{item.equipmentId}<br /><span className="shell-muted">{item.equipmentTypeCode}, quantity {item.quantity}</span></p>)}
            </Card>
            <Card>
              <h2>Booking summary</h2>
              <dl><div><dt>Customer</dt><dd>{result.value.customerId}</dd></div><div><dt>Status</dt><dd>{result.value.status}</dd></div></dl>
            </Card>
          </section>
          {result.value.pricingSnapshot ? (
            <Card title="Pricing evidence">
              <p><strong>{result.value.currency ?? "Currency unavailable"} {result.value.pricingSnapshot.quotedAmounts.total ?? result.value.pricingSnapshot.quotedAmounts.amount ?? "Quoted"}</strong></p>
              <p>Quote {result.value.pricingSnapshot.pricingQuoteId}; request {result.value.pricingSnapshot.pricingRequestId}</p>
              <p className="shell-muted">Source status {result.value.pricingSnapshot.status}; quoted {new Date(result.value.pricingSnapshot.quotedAt).toLocaleString()}</p>
            </Card>
          ) : result.value.status === "PRICED" || result.value.status === "CONFIRMED" ? (
            <StatusStrip tone="warning" role="status" data-state="degraded">Pricing source evidence is temporarily unavailable. Booking status remains service-authoritative.</StatusStrip>
          ) : null}
          {result.value.status === "MANUAL_PRICING" ? (
            <StatusStrip tone="danger" role="alert" data-state="validation-blocked">
              <h2>Manual pricing required</h2>
              <p>{result.value.attributes.manualPricingReasonMessage || result.value.attributes.manualPricingReasonCode || "Pricing requires operator review."}</p>
              <p className="shell-muted">Request {result.value.attributes.manualPricingRequestId || "booking-only"}; correlation {result.value.attributes.manualPricingCorrelationId || "not recorded"}</p>
            </StatusStrip>
          ) : null}
          {result.value.movementStatuses.length ? (
            <Card title="Journey status" data-testid="booking-movement-evidence">
              {result.value.movementStatuses.map((movement) => (
                <div key={movement.eventId}>
                  <p><strong>{movement.moveCode} — {movement.derivedStatus.replaceAll("_", " ")}</strong> ({movement.eventClassifierCode})</p>
                  <p>{movement.containerRef}{movement.location?.unLocationCode ? ` at ${movement.location.unLocationCode}` : ""}</p>
                  <p className="shell-muted">Occurred {new Date(movement.occurredDateTime).toLocaleString()}; received {new Date(movement.receivedDateTime).toLocaleString()}; source {movement.source}</p>
                </div>
              ))}
            </Card>
          ) : null}
          {result.value.status === "CONFIRMED" && !result.value.movementStatuses?.length ? (
            <StatusStrip tone="warning" role="status" data-state="degraded">Downstream movement evidence is not available yet. Confirmation remains established by the Booking service.</StatusStrip>
          ) : null}
          <Card title="Lifecycle" data-testid="booking-lifecycle-evidence">
            {result.value.lifecycleEvents.length ? (
              <ol>{result.value.lifecycleEvents.map((event, index) => <li key={`${event.eventType}-${index}`}><strong>{event.eventType}</strong> <time dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString()}</time></li>)}</ol>
            ) : <p className="shell-muted">No lifecycle evidence is available.</p>}
          </Card>
          <Stack>
            <BookingActions bookingId={result.value.id} status={result.value.status} />
            <a href="/booking">Back to Booking</a>
            <details className="erp-card">
              <summary>Audit and support evidence</summary>
              <p>Correlation reference <code>{result.correlationId}</code></p>
              <p className="shell-muted">Technical payloads and credentials are intentionally excluded.</p>
            </details>
          </Stack>
        </section>
      )}
    </>
  );
}
