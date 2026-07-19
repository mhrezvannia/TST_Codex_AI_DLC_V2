"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ShellBookingStatus } from "../../../lib/booking-client";

type BookingAction = "validate" | "price" | "confirm";

const actionLabel: Record<BookingAction, string> = {
  validate: "Validate references",
  price: "Price",
  confirm: "Confirm"
};

export function BookingActions({ bookingId, status }: { bookingId: string; status: ShellBookingStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState<BookingAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function execute(action: BookingAction) {
    setBusy(action);
    setError(null);
    const idempotencyKey = crypto.randomUUID();
    const response = await fetch(
      `/api/booking/bookings/${encodeURIComponent(bookingId)}/${action}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKey
        },
        body: action === "price" ? JSON.stringify({ idempotencyKey }) : "{}"
      }
    );
    const payload = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) {
      setError(payload.message ?? `${actionLabel[action]} failed`);
      return;
    }
    router.refresh();
  }

  return (
    <section className="shell-panel shell-booking-actions" aria-labelledby="shell-booking-actions-title">
      <div>
        <h2 id="shell-booking-actions-title">Booking actions</h2>
        <p className="shell-muted">Complete the next available lifecycle step.</p>
      </div>
      <div className="shell-actions">
        <button
          className="shell-button shell-button-primary"
          data-testid="booking-validate"
          disabled={status !== "DRAFT" && status !== "VALIDATION_BLOCKED" || busy !== null}
          onClick={() => execute("validate")}
          type="button"
        >
          {busy === "validate" ? "Validating..." : "Validate references"}
        </button>
        <button
          className="shell-button shell-button-primary"
          data-testid="booking-price"
          disabled={status !== "VALIDATED" || busy !== null}
          onClick={() => execute("price")}
          type="button"
        >
          {busy === "price" ? "Pricing..." : "Price"}
        </button>
        <button
          className="shell-button shell-button-primary"
          data-testid="booking-confirm"
          disabled={status !== "PRICED" || busy !== null}
          onClick={() => execute("confirm")}
          type="button"
        >
          {busy === "confirm" ? "Confirming..." : "Confirm"}
        </button>
      </div>
      {error && <p className="shell-error" role="alert">{error}</p>}
    </section>
  );
}
