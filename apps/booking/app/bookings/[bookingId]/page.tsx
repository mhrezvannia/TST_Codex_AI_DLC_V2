import Link from "next/link";
import { actorSubjectFromSession, sessionFromCookieHeader } from "@erp/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { loadBooking, safeBookingReturnTo } from "../../../lib/bookings";
import { BookingValidationPanel } from "./BookingValidationPanel";
import { JourneyStatusPanel } from "./JourneyStatusPanel";

export default async function BookingDetailPage({ params, searchParams }: { params: Promise<{ bookingId: string }>; searchParams: Promise<{ created?: string; returnTo?: string }> }) {
  const [{ bookingId }, query] = await Promise.all([params, searchParams]);
  const headerStore = await headers();
  const actorSubjectId = actorSubjectFromSession(sessionFromCookieHeader(headerStore.get("cookie")));
  const result = await loadBooking(bookingId, actorSubjectId);
  if (!result.ok && result.status === 404) notFound();
  if (!result.ok) return <main className="booking-page"><section className="booking-state booking-state-error"><h1>Booking unavailable</h1><p>{result.message}</p><a href={`/bookings/${bookingId}`}>Retry</a></section></main>;
  const booking = result.value;
  const returnTo = safeBookingReturnTo(query.returnTo);
  return <main className="booking-page">
    {query.created === "1" && <p className="booking-success" role="status">Booking created</p>}
    <Link href={returnTo}>Back to bookings</Link>
    <div className="booking-heading-row"><div><p className="booking-eyebrow">{booking.status}</p><h1>{booking.bookingNumber}</h1><p className="booking-muted">Revision {booking.revision}</p></div><span className={`booking-status booking-status-${booking.status.toLowerCase()}`}>{booking.status}</span></div>
    {booking.legacyIncomplete && <section className="booking-state booking-state-error"><h2>Correction required</h2><p>This legacy booking is readable but needs route and equipment identity before continuing.</p></section>}
    <section className="booking-detail-grid"><div><h2>Customer</h2><p>{booking.customerId}</p></div><div><h2>Route</h2>{booking.routing.map((leg) => <p key={leg.legSequence}>{leg.loadUnLocode} to {leg.dischargeUnLocode}<br /><span className="booking-muted">Voyage {leg.voyageId}</span></p>)}</div><div><h2>Equipment</h2>{booking.equipment.map((item) => <p key={item.equipmentId}>{item.equipmentId}<br /><span className="booking-muted">{item.equipmentTypeCode}, quantity {item.quantity}</span></p>)}</div><div><h2>Cargo setup</h2><p>{booking.currency} / {booking.cargoMode}<br /><span className="booking-muted">Reefer: {booking.reefer ? "Yes" : "No"}; DG: {booking.dangerousGoods ? "Yes" : "No"}</span></p></div></section>
    {!booking.legacyIncomplete && <BookingValidationPanel bookingId={booking.id} status={booking.status} initialValidation={booking.referenceValidation} />}
    {booking.pricingSnapshot && <section className="booking-pricing" aria-labelledby="booking-pricing-title">
      <h2 id="booking-pricing-title">Pricing</h2>
      <p><strong>{booking.pricingSnapshot.quotedAmounts.pricingBasis ?? "Quote"}</strong> {booking.pricingSnapshot.pricingQuoteId}</p>
      <dl>{Object.entries(booking.pricingSnapshot.quotedAmounts).filter(([key]) => key !== "pricingBasis").map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
      <p className="booking-muted">Correlation {booking.pricingSnapshot.correlationId}</p>
    </section>}
    {booking.status === "MANUAL_PRICING" && <section className="booking-state booking-state-error" aria-labelledby="booking-manual-pricing-title">
      <h2 id="booking-manual-pricing-title">Manual pricing required</h2>
      <p>{booking.attributes.manualPricingReasonMessage || booking.attributes.manualPricingReasonCode || "Pricing requires operator review."}</p>
      <p className="booking-muted">Request {booking.attributes.manualPricingRequestId || "booking-only"}; correlation {booking.attributes.manualPricingCorrelationId || "not recorded"}</p>
    </section>}
    <JourneyStatusPanel bookingId={booking.id} status={booking.status} initialStatuses={booking.movementStatuses} />
    <section className="booking-lifecycle"><h2>Lifecycle</h2><ol>{booking.lifecycleEvents.map((event, index) => <li key={`${event.eventType}-${index}`}><strong>{event.eventType}</strong><time>{new Date(event.occurredAt).toLocaleString()}</time></li>)}</ol></section>
  </main>;
}
