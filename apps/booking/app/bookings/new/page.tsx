import { headers } from "next/headers";
import { actorSubjectFromSession, sessionFromCookieHeader } from "@erp/auth";
import {
  Breadcrumbs,
  FailureState,
  PageHeader,
  TechnicalDetails
} from "@erp/ui";
import { loadBookingReferenceCatalog } from "../../../lib/bookings";
import { BookingCreateForm } from "./BookingCreateForm";

export default async function NewBookingPage() {
  const headerStore = await headers();
  const actorSubjectId = actorSubjectFromSession(
    sessionFromCookieHeader(headerStore.get("cookie"))
  );
  const catalog = await loadBookingReferenceCatalog(actorSubjectId);

  return (
    <main className="booking-page" id="booking-main">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Bookings", href: "/bookings" },
        { label: "New booking" }
      ]} />
      <PageHeader
        eyebrow="Booking draft"
        title="New booking"
        description="Create a draft from canonical customer, route, voyage, and equipment data."
      />
      {!catalog.ok ? (
        <FailureState
          icon={catalog.status === 401 ? "user" : "cloud-off"}
          title={catalog.status === 401 ? catalog.title : "Reference choices are unavailable"}
          actions={
            <>
              {catalog.status === 401 ? (
                <a className="erp-btn erp-btn--primary" href="/auth/?returnUrl=%2Fbookings%2Fnew">Sign in again</a>
              ) : null}
              {catalog.retryable ? <a className="erp-btn erp-btn--primary" href="/bookings/new">Retry</a> : null}
              <a className="erp-btn" href="/bookings">Back to bookings</a>
            </>
          }
          technicalDetails={<TechnicalDetails items={[
            { term: "Support reference", description: catalog.supportReference },
            { term: "Time", description: new Date(catalog.occurredAt).toLocaleString("en", { timeZone: "UTC" }) }
          ]} />}
        >
          <p>Canonical reference data must be available before a booking draft can be created.</p>
        </FailureState>
      ) : (
        <BookingCreateForm options={catalog.value} />
      )}
    </main>
  );
}
