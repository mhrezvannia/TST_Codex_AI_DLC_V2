import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BookingView } from "../../../lib/bookings";
import { JourneyStatusPanel } from "./JourneyStatusPanel";

const movementStatus: BookingView["movementStatuses"][number] = {
  bookingRef: "booking-1",
  containerRef: "MSCU6639870",
  movementId: "move-1",
  moveCode: "LOAD",
  eventClassifierCode: "ACT",
  occurredDateTime: "2026-07-16T10:00:00Z",
  receivedDateTime: "2026-07-16T10:01:00Z",
  derivedStatus: "LOADED",
  emptyIndicatorCode: "LADEN",
  transshipment: false,
  location: {
    unLocationCode: "CNSHA",
    facilityCode: "SHA01",
    facilityTypeCode: "TERMINAL"
  },
  eventId: "event-1",
  source: "container-movement-service",
  eventTime: "2026-07-16T10:01:00Z",
  dataSchemaVersion: 1,
  correlationId: "corr-1",
  projectedAt: "2026-07-16T10:01:01Z"
};

describe("JourneyStatusPanel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the initial local movement projection", () => {
    render(<JourneyStatusPanel bookingId="booking-1" status="CONFIRMED" initialStatuses={[movementStatus]} />);

    expect(screen.getByText("LOADED")).toBeTruthy();
    expect(screen.getByText(/MSCU6639870 at CNSHA/)).toBeTruthy();
  });

  it("polls booking detail until a movement projection appears", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      movementStatuses: [movementStatus]
    }), { status: 200, headers: { "content-type": "application/json" } })));

    render(<JourneyStatusPanel bookingId="booking-1" status="CONFIRMED" initialStatuses={[]} />);

    expect(screen.getByText("PENDING_EVENT")).toBeTruthy();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(screen.getByText("LOADED")).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith("/api/bookings/booking-1", expect.objectContaining({
      cache: "no-store"
    }));
  });

  it("stops after the bounded polling window and exposes retry", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      movementStatuses: []
    }), { status: 200, headers: { "content-type": "application/json" } })));

    render(<JourneyStatusPanel bookingId="booking-1" status="CONFIRMED" initialStatuses={[]} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });

    expect(screen.getByText("Container Movement has not projected a journey status yet.")).toBeTruthy();
    expect(screen.getByTestId("journey-status-retry")).toBeTruthy();
  });
});
