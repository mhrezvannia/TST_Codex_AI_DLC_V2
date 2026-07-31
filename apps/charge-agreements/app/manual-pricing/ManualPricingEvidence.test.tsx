import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ManualPricingEvidence } from "./ManualPricingEvidence";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ManualPricingEvidence", () => {
  it("renders read-only OPEN evidence without commercial or workflow controls", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [{
        caseId: "case-1",
        pricingRequestId: "BK-1:0",
        reasonCode: "NO_RATE",
        status: "OPEN",
        bookingRef: "BK-1",
        amendmentSeq: 0,
        requestHash: "a".repeat(64),
        correlationId: "corr-1",
        openedAt: "2026-07-28T10:00:00Z",
        requestContext: null,
        legacyEvidence: false
      }],
      total: 1,
      page: 0,
      size: 25
    }), { status: 200, headers: { "content-type": "application/json" } })));

    render(<ManualPricingEvidence />);

    await waitFor(() => expect(screen.getByTestId("manual-case-row-case-1")).toBeTruthy());
    expect(screen.getByText("1 OPEN cases")).toBeTruthy();
    expect(screen.getByRole("button", { name: "View evidence" })).toBeTruthy();
    expect(screen.queryByText(/approve/i)).toBeNull();
    expect(screen.queryByText(/amount/i)).toBeNull();
    expect(screen.queryByText(/resolve case/i)).toBeNull();
  });

  it("renders an explicit filtered-empty state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [], total: 0, page: 0, size: 25
    }), { status: 200, headers: { "content-type": "application/json" } })));
    render(<ManualPricingEvidence />);
    await waitFor(() => expect(screen.getByText("No OPEN evidence matches these filters")).toBeTruthy());
  });

  it("supports keyboard-reachable filters, canonical selection, focus restoration, and live updates", async () => {
    const longCaseId = `case-${"x".repeat(120)}`;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/manual-cases/")) {
        return new Response(JSON.stringify(manualCase(longCaseId, true)), {
          status: 200, headers: { "content-type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        items: [
          manualCase(longCaseId, true),
          manualCase("case-earlier", false)
        ],
        total: 2,
        page: 0,
        size: 25
      }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState(null, "", "/charge-agreements/manual-pricing");
    render(<ManualPricingEvidence />);

    await screen.findByTestId(`manual-case-view-${longCaseId}`);
    const status = screen.getByTestId("manual-case-status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    const booking = screen.getByLabelText("Booking reference");
    booking.focus();
    fireEvent.change(booking, { target: { value: "BK-FILTER-LONG" } });
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "NO_RATE" } });
    fireEvent.submit(screen.getByTestId("apply-manual-filters").closest("form")!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
      "status=OPEN&reasonCode=NO_RATE&bookingRef=BK-FILTER-LONG&page=0&size=25"
    );

    const trigger = screen.getByTestId(`manual-case-view-${longCaseId}`);
    trigger.focus();
    fireEvent.click(trigger);
    const heading = await screen.findByRole("heading", { name: "Case evidence" });
    await waitFor(() => expect(document.activeElement).toBe(heading));
    expect(window.location.search).toContain(`case=${encodeURIComponent(longCaseId)}`);
    expect(screen.getAllByText("Unavailable (legacy)", { selector: "dd" }).length).toBeGreaterThan(0);
    expect(screen.getByText(/historical case has limited evidence/i)).toBeTruthy();

    fireEvent.click(screen.getByTestId("manual-case-close"));
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(window.location.search).not.toContain("case=");
  });

  it("normalizes service errors and renders no prohibited commercial workflow controls", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: "MANUAL_CASE_UNAVAILABLE",
      message: "Manual pricing evidence is unavailable",
      correlationId: "corr-safe"
    }), { status: 503, headers: { "content-type": "application/json" } })));
    render(<ManualPricingEvidence />);

    expect(await screen.findByRole("heading", { name: "Evidence service unavailable" })).toBeTruthy();
    expect(screen.getByTestId("manual-case-status")).toHaveTextContent("Manual pricing evidence is unavailable");
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    for (const prohibited of [
      /unit rate/i, /total/i, /quote/i, /assign/i, /approve/i,
      /resolve/i, /close case/i, /reprice/i
    ]) {
      expect(screen.queryByText(prohibited)).toBeNull();
    }
  });
});

function manualCase(caseId: string, legacyEvidence: boolean) {
  return {
    caseId,
    pricingRequestId: `${caseId}:0`,
    reasonCode: "NO_RATE",
    status: "OPEN",
    bookingRef: legacyEvidence ? null : "BK-1",
    amendmentSeq: legacyEvidence ? null : 0,
    requestHash: legacyEvidence ? null : "a".repeat(64),
    correlationId: legacyEvidence ? null : "corr-1",
    openedAt: legacyEvidence ? null : "2026-07-28T10:00:00Z",
    requestContext: null,
    legacyEvidence
  };
}
