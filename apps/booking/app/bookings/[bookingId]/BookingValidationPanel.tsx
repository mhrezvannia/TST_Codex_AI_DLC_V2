"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingStatus, BookingView } from "../../../lib/bookings";

type ValidationSnapshot = BookingView["referenceValidation"];

export function BookingValidationPanel({
  bookingId,
  status,
  initialValidation
}: {
  bookingId: string;
  status: BookingStatus;
  initialValidation: ValidationSnapshot;
}) {
  const router = useRouter();
  const [validation, setValidation] = useState(initialValidation);
  const [busy, setBusy] = useState(false);
  const [pricingBusy, setPricingBusy] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [pricingError, setPricingError] = useState<{ code: string; message: string } | null>(null);
  const [confirmError, setConfirmError] = useState<{ code: string; message: string } | null>(null);

  async function validate() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/validate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": crypto.randomUUID()
      },
      body: "{}"
    });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError({ code: payload.code ?? "BOOKING_REQUEST_FAILED", message: payload.message ?? "Validation failed" });
      return;
    }
    setValidation(payload.referenceValidation ?? null);
    router.refresh();
  }

  async function confirm() {
    setConfirmBusy(true);
    setConfirmError(null);
    const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/confirm`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": crypto.randomUUID()
      },
      body: "{}"
    });
    const payload = await response.json().catch(() => ({}));
    setConfirmBusy(false);
    if (!response.ok) {
      setConfirmError({ code: payload.code ?? "BOOKING_REQUEST_FAILED", message: payload.message ?? "Confirmation failed" });
      return;
    }
    router.refresh();
  }

  async function price() {
    setPricingBusy(true);
    setPricingError(null);
    const idempotencyKey = crypto.randomUUID();
    const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/price`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": idempotencyKey
      },
      body: JSON.stringify({ idempotencyKey })
    });
    const payload = await response.json().catch(() => ({}));
    setPricingBusy(false);
    if (!response.ok) {
      setPricingError({ code: payload.code ?? "BOOKING_REQUEST_FAILED", message: payload.message ?? "Pricing failed" });
      return;
    }
    router.refresh();
  }

  const blocked = validation?.outcome === "BLOCKED" ? validation.fieldResults.filter((field) => field.outcome !== "ACTIVE") : [];
  const validated = validation?.outcome === "VALID" && status === "VALIDATED";
  const priceEnabled = status === "VALIDATED";
  const confirmEnabled = status === "PRICED";

  return <section className="booking-validation" aria-labelledby="booking-validation-title">
    <div className="booking-heading-row">
      <div>
        <h2 id="booking-validation-title">Reference validation</h2>
        {validated && <p className="booking-success" role="status">Booking validated</p>}
        {!validated && blocked.length === 0 && !error && <p className="booking-muted">Not yet verified</p>}
      </div>
      <div className="booking-actions">
        <button data-testid="booking-validate" className="booking-button booking-button-primary" type="button" disabled={busy || validated} onClick={validate}>
          {busy ? "Validating..." : validated ? "Validated" : "Validate references"}
        </button>
        <button data-testid="booking-price" className="booking-button booking-button-primary" type="button" disabled={!priceEnabled || pricingBusy} onClick={price}>
          {pricingBusy ? "Pricing..." : "Price"}
        </button>
        <button data-testid="booking-confirm" className="booking-button booking-button-primary" type="button" disabled={!confirmEnabled || confirmBusy} onClick={confirm}>
          {confirmBusy ? "Confirming..." : "Confirm"}
        </button>
      </div>
    </div>
    {error && <div className="booking-state booking-state-error" role="alert">
      <h3>{error.code === "REFERENCE_DATA_UNAVAILABLE" ? "Reference Data unavailable" : "Validation could not finish"}</h3>
      <p>{error.message}</p>
      <button className="booking-button" type="button" onClick={validate} disabled={busy}>Retry</button>
    </div>}
    {pricingError && <div className="booking-state booking-state-error" role="alert">
      <h3>{pricingError.code === "PRICING_IN_PROGRESS" ? "Pricing already in progress" : "Pricing could not finish"}</h3>
      <p>{pricingError.message}</p>
      <button className="booking-button" type="button" onClick={price} disabled={!priceEnabled || pricingBusy}>Retry</button>
    </div>}
    {confirmError && <div className="booking-state booking-state-error" role="alert">
      <h3>Confirmation could not finish</h3>
      <p>{confirmError.message}</p>
      <button className="booking-button" type="button" onClick={confirm} disabled={!confirmEnabled || confirmBusy}>Retry</button>
    </div>}
    {blocked.length > 0 && <div className="booking-error-summary" role="alert">
      <strong>Reference correction required</strong>
      <ul>{blocked.map((field) => <li key={field.fieldPath}>
        <a href={`/bookings/new?correct=${encodeURIComponent(field.fieldPath)}`}>{fieldLabel(field.fieldPath)}: {reasonLabel(field.reasonCode)}</a>
      </li>)}</ul>
    </div>}
  </section>;
}

function fieldLabel(path: string) {
  const labels: Record<string, string> = {
    customerId: "Customer",
    "routing[0].loadUnLocode": "Load location",
    "routing[0].dischargeUnLocode": "Discharge location",
    "routing[0].voyageId": "Voyage",
    "equipment[0].equipmentTypeCode": "Equipment type"
  };
  return labels[path] ?? path;
}

function reasonLabel(code: string) {
  const labels: Record<string, string> = {
    REFERENCE_NOT_FOUND: "not found",
    REFERENCE_INACTIVE: "inactive",
    REFERENCE_MISMATCH: "does not match",
    VOYAGE_RECORD_REQUIRED: "not a voyage",
    VOYAGE_ORIGIN_MISMATCH: "does not match voyage origin",
    VOYAGE_DESTINATION_MISMATCH: "does not match voyage destination",
    VOYAGE_ROUTE_MISMATCH: "does not match the selected route"
  };
  return labels[code] ?? "invalid";
}
