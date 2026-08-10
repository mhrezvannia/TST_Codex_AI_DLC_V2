"use client";

import { useState } from "react";
import { Breadcrumbs, Button, FailureState, IdentifierValue, TechnicalDetails } from "@erp/ui";

export default function BookingRouteError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <main className="booking-page" id="booking-main">
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Bookings", href: "/bookings" },
        { label: "Unavailable" }
      ]} />
      <FailureState
        icon="alert-circle"
        title="Booking could not be displayed"
        actions={
          <>
            <Button
              variant="primary"
              busy={busy}
              busyLabel="Retrying"
              onClick={() => {
                setBusy(true);
                reset();
              }}
            >
              Retry
            </Button>
            <a className="erp-btn" href="/bookings">Back to bookings</a>
          </>
        }
        technicalDetails={error.digest ? (
          <TechnicalDetails items={[
            { term: "Support reference", description: <IdentifierValue>{error.digest}</IdentifierValue> }
          ]} />
        ) : undefined}
      >
        <p>An unexpected display error occurred. Your booking data was not changed.</p>
      </FailureState>
    </main>
  );
}
