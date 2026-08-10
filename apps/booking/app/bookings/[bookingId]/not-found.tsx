import { Breadcrumbs, FailureState } from "@erp/ui";

export default function BookingNotFound() {
  return (
    <main className="booking-page" id="booking-main">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Bookings", href: "/bookings" },
        { label: "Not found" }
      ]} />
      <FailureState
        icon="file-question"
        title="Booking not found"
        actions={
          <>
            <a className="erp-btn erp-btn--primary" href="/bookings">Back to bookings</a>
            <a className="erp-btn erp-btn--ghost" href="/">Return to workspace</a>
          </>
        }
      >
        <p>The booking may no longer be available, or the link may be out of date.</p>
      </FailureState>
    </main>
  );
}
