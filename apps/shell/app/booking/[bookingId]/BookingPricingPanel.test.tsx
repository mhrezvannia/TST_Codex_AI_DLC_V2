import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ShellPricingSnapshotEnvelope } from "../../../lib/booking-client";
import { BookingPricingPanel } from "./BookingPricingPanel";

describe("Shell BookingPricingPanel", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders exact ordered typed evidence and current/prior selection", () => {
    renderPanel({
      initialHistory: { current: typedEnvelope("current", 1), prior: [typedEnvelope("prior", 0)], nextCursor: null },
      initialPricingStatus: "PRICED",
      initialConfirmationEligible: true
    });
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1]).toHaveTextContent("OFR");
    expect(rows[2]).toHaveTextContent("BAF");
    expect(rows[3]).toHaveTextContent("THC");
    expect(screen.getByText("$130.00")).toBeInTheDocument();
    fireEvent.change(screen.getByTestId("booking-pricing-selector"), { target: { value: "1" } });
    expect(screen.getByText("agreement-version-prior")).toBeInTheDocument();
    expect(screen.getByText("Prior 1 · AGREEMENT · amendment 0")).toBeInTheDocument();
  });

  it("shows manual evidence without an invented amount or quote control", () => {
    renderPanel({ bookingStatus: "MANUAL_PRICING", initialPricingStatus: "MANUAL_PRICING_REQUIRED" });
    expect(screen.getByTestId("booking-pricing-manual")).toHaveTextContent("Manual pricing required");
    expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /manual quote/i })).not.toBeInTheDocument();
  });

  it.each([
    ["DENIED", "Pricing access denied"],
    ["TIMEOUT", "Pricing timed out"],
    ["UNAVAILABLE", "Pricing is unavailable"],
    ["CIRCUIT_OPEN", "Pricing is temporarily paused"]
  ] as const)("renders the %s state explicitly", (outcome, title) => {
    renderPanel({ initialPricingStatus: outcome });
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  });

  it("prices through the canonical shell proxy and restores focus", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    const fetchMock = vi.fn().mockResolvedValue(Response.json(commandResponse()));
    vi.stubGlobal("fetch", fetchMock);
    renderPanel({ bookingStatus: "VALIDATED" });
    fireEvent.click(screen.getByTestId("booking-first-price"));
    expect(screen.getByTestId("booking-pricing-loading")).toHaveAttribute("aria-label", "Loading pricing");
    await waitFor(() => expect(screen.getByTestId("booking-pricing-typed")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith("/api/booking/bookings/booking-1/price", expect.objectContaining({ method: "POST" }));
    expect(screen.getByRole("heading", { name: "Pricing evidence" })).toHaveFocus();
  });

  it("reports an unreadable provider response and preserves prior evidence", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ unreadable: true })));
    renderPanel({ bookingStatus: "VALIDATED" });
    fireEvent.click(screen.getByTestId("booking-first-price"));
    expect(await screen.findByRole("alert")).toHaveTextContent("unreadable response");
    expect(screen.getByTestId("booking-pricing-retry")).toBeInTheDocument();
  });
});

function renderPanel(overrides: Partial<React.ComponentProps<typeof BookingPricingPanel>> = {}) {
  return render(<BookingPricingPanel
    bookingId="booking-1"
    bookingStatus="DRAFT"
    initialSnapshot={null}
    initialHistory={null}
    initialPricingStatus="UNPRICED"
    initialConfirmationEligible={false}
    {...overrides}
  />);
}

function typedEnvelope(suffix: string, amendmentSeq: number): ShellPricingSnapshotEnvelope {
  const typed = {
    schemaVersion: 2 as const,
    pricingRequestId: `price-${suffix}`,
    bookingRef: "booking-1",
    amendmentSeq,
    bookingRevision: 2,
    inputFingerprint: "a".repeat(64),
    requestedDepartureDate: "2026-08-01",
    pricingBasis: "AGREEMENT" as const,
    pricingRef: `agreement-${suffix}`,
    agreementVersionId: `agreement-version-${suffix}`,
    lines: [
      line("OFR", "FREIGHT", "BASE", 100),
      line("BAF", "SURCHARGE", "SURCHARGE", 20),
      line("THC", "LOCAL", "LOCAL", 10)
    ],
    applicableDndRuleTypes: [],
    total: 130,
    currency: "USD" as const,
    pricedAt: "2026-07-29T10:00:00Z",
    correlationId: `corr-${suffix}`,
    createdAt: "2026-07-29T10:00:01Z"
  };
  return {
    pricingRequestId: typed.pricingRequestId,
    pricingQuoteId: typed.pricingRef,
    status: "QUOTED",
    quotedAmounts: {},
    receivedAt: typed.createdAt,
    correlationId: typed.correlationId,
    typed,
    legacy: null
  };
}

function line(chargeCode: string, category: "FREIGHT" | "SURCHARGE" | "LOCAL", rateCategory: "BASE" | "SURCHARGE" | "LOCAL", amount: number) {
  return { chargeCode, category, rateCategory, basis: "PER_CONTAINER" as const, quantity: 1, unitRate: amount,
    amount, currency: "USD" as const, sourceRateVersionId: `rate-${chargeCode}` };
}

function commandResponse() {
  const current = typedEnvelope("current", 1);
  return {
    result: { outcome: "PRICED", pricingRequestId: current.pricingRequestId, amendmentSeq: 1,
      inputFingerprint: "a".repeat(64), typedSnapshot: current.typed, legacySnapshot: null,
      failureEvidence: null, retryAfterSeconds: 0, correlationId: current.correlationId },
    history: { current, prior: [], nextCursor: null },
    confirmationEligible: true
  };
}
