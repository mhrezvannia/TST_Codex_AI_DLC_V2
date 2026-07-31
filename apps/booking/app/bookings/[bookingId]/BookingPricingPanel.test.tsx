import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PricingSnapshotEnvelope } from "../../../lib/bookings";
import { BookingPricingPanel } from "./BookingPricingPanel";

describe("BookingPricingPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders exact ordered itemisation and bounded current/prior selection", () => {
    renderPanel({
      initialHistory: {
        current: typedEnvelope("current", 1),
        prior: [typedEnvelope("prior", 0)],
        nextCursor: "bounded-cursor"
      },
      initialPricingStatus: "PRICED",
      initialConfirmationEligible: true
    });

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows[1]).toHaveTextContent("OFR");
    expect(rows[2]).toHaveTextContent("BAF");
    expect(rows[3]).toHaveTextContent("THC");
    expect(screen.getByText("$130.00")).toBeInTheDocument();
    expect(screen.getByText("agreement-version-current")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("booking-pricing-selector"), { target: { value: "1" } });

    expect(screen.getByText("agreement-version-prior")).toBeInTheDocument();
    expect(screen.getByText("Prior 1 · AGREEMENT · amendment 0")).toBeInTheDocument();
  });

  it("shows Reprice only for an explicit pricing-affecting amendment", () => {
    const { rerender } = renderPanel({
      bookingStatus: "AMENDED",
      initialHistory: { current: typedEnvelope("current", 0), prior: [], nextCursor: null },
      initialPricingStatus: "PRICED"
    });
    expect(screen.queryByTestId("booking-reprice")).not.toBeInTheDocument();

    rerender(<BookingPricingPanel
      bookingId="booking-1"
      bookingStatus="AMENDED"
      initialSnapshot={null}
      initialHistory={{ current: typedEnvelope("current", 0), prior: [], nextCursor: null }}
      initialPricingStatus="REPRICE_REQUIRED"
      initialConfirmationEligible={false}
    />);

    expect(screen.getByTestId("booking-reprice")).toHaveTextContent("Reprice");
    expect(screen.getByTestId("booking-pricing-stale")).toHaveTextContent("Prior evidence remains read-only");
  });

  it("labels legacy evidence read-only without synthesizing missing versions", () => {
    renderPanel({
      initialHistory: { current: legacyEnvelope(), prior: [], nextCursor: null },
      initialPricingStatus: "LEGACY_PRICED",
      initialConfirmationEligible: true
    });

    expect(screen.getByTestId("booking-pricing-legacy")).toHaveTextContent("predates typed line and version attribution");
    expect(screen.getByText("legacy-quote")).toBeInTheDocument();
    expect(screen.queryByText(/agreement version/i)).not.toBeInTheDocument();
  });

  it("renders manual no-rate and ambiguity states without money or manual quote controls", () => {
    const { rerender } = renderPanel({ initialPricingStatus: "MANUAL_PRICING_REQUIRED" });

    expect(screen.getByTestId("booking-pricing-manual")).toHaveTextContent("Manual pricing evidence");
    expect(screen.queryByText(/\$\d/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /manual quote/i })).not.toBeInTheDocument();

    rerender(<BookingPricingPanel
      bookingId="booking-1"
      bookingStatus="MANUAL_PRICING"
      initialSnapshot={null}
      initialHistory={null}
      initialPricingStatus="MANUAL_PRICING_REQUIRED"
      initialConfirmationEligible={false}
    />);
    expect(screen.getByText(/no total or manual quote control/i)).toBeInTheDocument();
  });

  it.each([
    ["DENIED", "Pricing access denied"],
    ["CONFLICT", "Pricing request conflicted"],
    ["IN_PROGRESS", "Pricing is already in progress"],
    ["TIMEOUT", "Pricing timed out"],
    ["UNAVAILABLE", "Pricing is unavailable"],
    ["CIRCUIT_OPEN", "Pricing is temporarily paused"]
  ] as const)("renders the %s terminal state explicitly", (outcome, heading) => {
    renderPanel({ initialPricingStatus: outcome });
    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    expect(screen.getByText(/confirmation remains blocked/i)).toBeInTheDocument();
  });

  it("supports keyboard command flow, announces success, and restores command focus", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(commandResponse())));
    renderPanel({ bookingStatus: "VALIDATED", initialPricingStatus: "UNPRICED" });
    const button = screen.getByTestId("booking-first-price");

    button.focus();
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.click(button);

    expect(screen.getByTestId("booking-pricing-loading")).toHaveAttribute("aria-label", "Loading pricing");
    await waitFor(() => expect(screen.getByTestId("booking-pricing-typed")).toBeInTheDocument());
    expect(screen.getByRole("status")).toHaveTextContent("Pricing completed");
    expect(document.activeElement).toBe(button);
    expect(screen.getByText("Current · AGREEMENT · amendment 1")).toBeInTheDocument();
  });

  it("preserves prior evidence on an unavailable response and exposes a focused retry", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    renderPanel({
      bookingStatus: "AMENDED",
      initialHistory: { current: typedEnvelope("prior", 0), prior: [], nextCursor: null },
      initialPricingStatus: "REPRICE_REQUIRED"
    });

    fireEvent.click(screen.getByTestId("booking-reprice"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Existing pricing evidence has been preserved");
    expect(screen.getByTestId("booking-pricing-retry")).toBeInTheDocument();
    expect(screen.getByText("agreement-version-prior")).toBeInTheDocument();
    expect(screen.getByTestId("booking-reprice")).toHaveFocus();
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

function typedEnvelope(suffix: string, amendmentSeq: number): PricingSnapshotEnvelope {
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
    ] as [
      ReturnType<typeof line> & { rateCategory: "BASE" },
      ReturnType<typeof line> & { rateCategory: "SURCHARGE" },
      ReturnType<typeof line> & { rateCategory: "LOCAL" }
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

function legacyEnvelope(): PricingSnapshotEnvelope {
  const legacy = {
    pricingRequestId: "legacy-price",
    pricingQuoteId: "legacy-quote",
    status: "QUOTED",
    quotedAmounts: { total: "90.00", currency: "USD" },
    receivedAt: "2026-06-01T10:00:00Z",
    correlationId: "corr-legacy"
  };
  return { ...legacy, typed: null, legacy };
}

function commandResponse() {
  const current = typedEnvelope("current", 1);
  return {
    result: {
      outcome: "PRICED",
      pricingRequestId: current.pricingRequestId,
      amendmentSeq: 1,
      inputFingerprint: "a".repeat(64),
      typedSnapshot: current.typed,
      legacySnapshot: null,
      failureEvidence: null,
      retryAfterSeconds: 0,
      correlationId: current.correlationId
    },
    history: { current, prior: [typedEnvelope("prior", 0)], nextCursor: null },
    confirmationEligible: true
  };
}

function line(
  chargeCode: string,
  category: "FREIGHT" | "SURCHARGE" | "LOCAL",
  rateCategory: "BASE" | "SURCHARGE" | "LOCAL",
  amount: number
) {
  return {
    chargeCode,
    category,
    rateCategory,
    basis: "PER_CONTAINER" as const,
    quantity: 1,
    unitRate: amount,
    amount,
    currency: "USD" as const,
    sourceRateVersionId: `rate-${chargeCode}`
  };
}
