import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BookingValidationPanel } from "./BookingValidationPanel";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

describe("BookingValidationPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    refresh.mockReset();
  });

  it("renders exact correction links from a completed blocked result", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "VALIDATION_BLOCKED",
      referenceValidation: {
        outcome: "BLOCKED",
        fieldResults: [{
          fieldPath: "routing[0].dischargeUnLocode",
          outcome: "INACTIVE",
          reasonCode: "REFERENCE_INACTIVE"
        }]
      }
    }), { status: 200, headers: { "content-type": "application/json" } })));
    render(<BookingValidationPanel bookingId="booking-1" status="DRAFT" initialValidation={null} />);

    fireEvent.click(screen.getByTestId("booking-validate"));

    const link = await screen.findByRole("link", { name: "Discharge location: inactive" });
    expect(link.getAttribute("href")).toContain("correct=routing%5B0%5D.dischargeUnLocode");
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("keeps provider unavailability separate and retryable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: "REFERENCE_DATA_UNAVAILABLE",
      message: "Reference Data is unavailable"
    }), { status: 503, headers: { "content-type": "application/json" } })));
    render(<BookingValidationPanel bookingId="booking-1" status="DRAFT" initialValidation={null} />);

    fireEvent.click(screen.getByTestId("booking-validate"));

    expect(await screen.findByRole("heading", { name: "Reference Data unavailable" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("posts pricing request only for validated bookings", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "PRICED",
      pricingSnapshot: { pricingQuoteId: "quote-1", quotedAmounts: { pricingBasis: "AGREEMENT" } }
    }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    render(<BookingValidationPanel bookingId="booking-1" status="VALIDATED" initialValidation={{
      bookingRevision: 0,
      referenceFingerprint: "abc",
      outcome: "VALID",
      fieldResults: [],
      checkedAt: "2026-07-01T00:00:00Z",
      correlationId: "corr"
    }} />);

    fireEvent.click(screen.getByTestId("booking-price"));

    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith("/api/bookings/booking-1/price", expect.objectContaining({
      method: "POST"
    }));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).idempotencyKey).toBeTruthy();
  });

  it("posts confirmation request only for priced bookings", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: "CONFIRMED"
    }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    render(<BookingValidationPanel bookingId="booking-1" status="PRICED" initialValidation={{
      bookingRevision: 0,
      referenceFingerprint: "abc",
      outcome: "VALID",
      fieldResults: [],
      checkedAt: "2026-07-01T00:00:00Z",
      correlationId: "corr"
    }} />);

    fireEvent.click(screen.getByTestId("booking-confirm"));

    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(fetchMock).toHaveBeenCalledWith("/api/bookings/booking-1/confirm", expect.objectContaining({
      method: "POST",
      body: "{}"
    }));
  });
});
