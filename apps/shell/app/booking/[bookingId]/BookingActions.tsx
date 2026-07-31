"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, StatusStrip } from "@erp/ui";
import type { ShellBookingStatus } from "../../../lib/booking-client";

type BookingAction = "validate" | "price" | "confirm";

const actionLabel: Record<BookingAction, string> = {
  validate: "Validate references",
  price: "Price",
  confirm: "Confirm"
};

type ActionState =
  | { state: "idle" }
  | { state: "pending"; action: BookingAction; idempotencyKey: string }
  | { state: "success"; action: BookingAction; authoritativeStatus: ShellBookingStatus }
  | { state: "validationBlocked" | "recoverableError" | "denied" | "degraded" | "fatalError"; action: BookingAction; message: string; idempotencyKey: string };

const expectedStatus: Record<BookingAction, ShellBookingStatus> = {
  validate: "VALIDATED",
  price: "PRICED",
  confirm: "CONFIRMED"
};

export function BookingActions({ bookingId, status }: { bookingId: string; status: ShellBookingStatus }) {
  const router = useRouter();
  const [actionState, setActionState] = useState<ActionState>({ state: "idle" });
  const resultRef = useRef<HTMLDivElement>(null);
  const busy = actionState.state === "pending" ? actionState.action : null;

  useEffect(() => {
    if (actionState.state !== "idle" && actionState.state !== "pending") resultRef.current?.focus();
  }, [actionState]);

  async function execute(action: BookingAction, retryKey?: string) {
    if (actionState.state === "pending") return;
    const idempotencyKey = retryKey ?? crypto.randomUUID();
    setActionState({ state: "pending", action, idempotencyKey });
    try {
      const response = await fetch(
        `/api/booking/bookings/${encodeURIComponent(bookingId)}/${action}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "idempotency-key": idempotencyKey
          },
          body: "{}"
        }
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload.message === "string" ? payload.message : `${actionLabel[action]} failed`;
        const nextState = response.status === 400 || response.status === 422
          ? "validationBlocked"
          : response.status === 401 || response.status === 403
            ? "denied"
            : response.status === 502 || response.status === 503
              ? "degraded"
              : response.status === 408 || response.status === 429 || response.status >= 500
                ? "recoverableError"
                : "fatalError";
        setActionState({ state: nextState, action, message, idempotencyKey });
        return;
      }
      if (payload.status !== expectedStatus[action]) {
        setActionState({
          state: "recoverableError",
          action,
          message: `${actionLabel[action]} returned without authoritative ${expectedStatus[action]} status. Retry safely or review the booking.`,
          idempotencyKey
        });
        return;
      }
      setActionState({ state: "success", action, authoritativeStatus: payload.status });
      router.refresh();
    } catch {
      setActionState({
        state: "recoverableError",
        action,
        message: `${actionLabel[action]} could not reach Booking. Retry uses the same command key.`,
        idempotencyKey
      });
    }
  }

  return (
    <section className="shell-workbench shell-booking-actions" aria-labelledby="shell-booking-actions-title">
      <div>
        <h2 id="shell-booking-actions-title">Booking actions</h2>
        <p className="shell-muted">Current lifecycle: {statusLabel(status)}</p>
      </div>
      <div className="shell-booking-flow" aria-label="Booking lifecycle">
        {(["Draft", "Validate", "Price", "Confirm"] as const).map((label, index) => {
          const current = workflowIndex(status);
          const state = index < current ? "complete" : index === current ? "active" : "pending";
          return <div className={`shell-booking-flow-step shell-booking-flow-${state}`} key={label}><span>{index < current ? "OK" : index + 1}</span><strong>{label}</strong></div>;
        })}
      </div>
      <div className="shell-actions">
        <Button
          variant="primary"
          data-testid="booking-validate"
          disabled={status !== "DRAFT" && status !== "VALIDATION_BLOCKED" || busy !== null}
          onClick={() => execute("validate")}
          type="button"
        >
          {busy === "validate" ? "Validating..." : "Validate references"}
        </Button>
        <Button
          variant="primary"
          data-testid="booking-price"
          disabled={status !== "VALIDATED" || busy !== null}
          onClick={() => execute("price")}
          type="button"
        >
          {busy === "price" ? "Pricing..." : "Price"}
        </Button>
        <Button
          variant="primary"
          data-testid="booking-confirm"
          disabled={status !== "PRICED" || busy !== null}
          onClick={() => execute("confirm")}
          type="button"
        >
          {busy === "confirm" ? "Confirming..." : "Confirm"}
        </Button>
      </div>
      {actionState.state === "pending" ? <StatusStrip role="status" aria-busy="true" data-state="pending">Running {actionLabel[actionState.action]}</StatusStrip> : null}
      {actionState.state === "success" ? (
        <StatusStrip ref={resultRef} tabIndex={-1} tone="success" role="status" data-state="success">
          {actionLabel[actionState.action]} completed: <strong data-testid="booking-authoritative-status">{actionState.authoritativeStatus}</strong>
        </StatusStrip>
      ) : null}
      {"message" in actionState ? (
        <StatusStrip
          ref={resultRef}
          tabIndex={-1}
          tone={actionState.state === "degraded" ? "warning" : "danger"}
          role={actionState.state === "validationBlocked" || actionState.state === "denied" || actionState.state === "fatalError" ? "alert" : "status"}
          live={actionState.state === "validationBlocked" || actionState.state === "denied" || actionState.state === "fatalError" ? "assertive" : "polite"}
          data-state={actionState.state}
        >
          {actionState.message}
          {actionState.state === "recoverableError" || actionState.state === "degraded" ? (
            <Button size="sm" onClick={() => execute(actionState.action, actionState.idempotencyKey)} data-testid="booking-action-retry">Retry {actionLabel[actionState.action]}</Button>
          ) : null}
        </StatusStrip>
      ) : null}
    </section>
  );
}

function workflowIndex(status: ShellBookingStatus) {
  if (status === "CONFIRMED" || status === "RECONFIRMED") return 4;
  if (status === "PRICED") return 3;
  if (status === "VALIDATED" || status === "PRICING_PENDING" || status === "MANUAL_PRICING") return 2;
  if (status === "DRAFT" || status === "VALIDATION_BLOCKED") return 1;
  return 0;
}

function statusLabel(status: ShellBookingStatus) {
  return status.toLowerCase().replaceAll("_", " ");
}
