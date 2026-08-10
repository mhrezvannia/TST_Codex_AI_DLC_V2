"use client";

import { useEffect, useRef, useState } from "react";
import type { BookingStatus, BookingView } from "../../../lib/bookings";

type MovementStatus = BookingView["movementStatuses"][number];

export function JourneyStatusPanel({
  bookingId,
  status,
  initialStatuses
}: {
  bookingId: string;
  status: BookingStatus;
  initialStatuses: MovementStatus[];
}) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [delayed, setDelayed] = useState(false);
  const [pollCycle, setPollCycle] = useState(0);
  const attempts = useRef(0);
  const active = status === "CONFIRMED" || status === "RECONFIRMED";

  useEffect(() => {
    setStatuses(initialStatuses);
    setDelayed(false);
    attempts.current = 0;
  }, [initialStatuses]);

  useEffect(() => {
    if (!active || statuses.length > 0 || delayed) return;
    let stopped = false;
    const interval = window.setInterval(async () => {
      if (document.hidden || stopped) return;
      attempts.current += 1;
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 2500);
      try {
        const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
          cache: "no-store",
          signal: controller.signal
        });
        if (response.ok) {
          const payload = await response.json() as BookingView;
          if (payload.movementStatuses.length > 0) {
            setStatuses(payload.movementStatuses);
            stopped = true;
            window.clearInterval(interval);
          }
        }
      } catch {
        // Keep polling until the bounded window expires.
      } finally {
        window.clearTimeout(timeout);
      }
      if (attempts.current >= 30 && !stopped) {
        setDelayed(true);
        window.clearInterval(interval);
      }
    }, 1000);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [active, bookingId, delayed, pollCycle, statuses.length]);

  if (!active) return null;

  return <section className="booking-state" aria-labelledby="booking-journey-title">
    <h2 id="booking-journey-title">Journey status</h2>
    {statuses.length > 0 ? statuses.map((movementStatus) => <div key={movementStatus.containerRef}>
      <p><strong>{movementStatus.derivedStatus}</strong> {movementStatus.moveCode} / {movementStatus.eventClassifierCode}</p>
      <p className="booking-muted">{movementStatus.containerRef}{movementStatus.location?.unLocationCode ? ` at ${movementStatus.location.unLocationCode}` : ""}; occurred {new Date(movementStatus.occurredDateTime).toLocaleString()}</p>
    </div>) : <>
      <p><strong>PENDING_EVENT</strong></p>
      <p className="booking-muted">{delayed
        ? "Container Movement has not projected a journey status yet."
        : "Confirmation is committed locally. Container Movement will create the journey from the booking.confirmed event."}</p>
      {delayed && <button
        className="booking-button"
        data-testid="journey-status-retry"
        type="button"
        onClick={() => {
          attempts.current = 0;
          setDelayed(false);
          setPollCycle((value) => value + 1);
        }}
      >
        Retry
      </button>}
    </>}
  </section>;
}
