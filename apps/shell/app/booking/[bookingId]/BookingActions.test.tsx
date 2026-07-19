import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BookingActions } from "./BookingActions";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh })
}));

describe("Shell BookingActions", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    refresh.mockReset();
  });

  for (const scenario of [
    { action: "validate", status: "DRAFT" },
    { action: "price", status: "VALIDATED" },
    { action: "confirm", status: "PRICED" }
  ] as const) {
    it(`forwards ${scenario.action} with idempotency and refreshes the detail`, async () => {
      let calledUrl = "";
      let idempotencyKey = "";
      global.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        calledUrl = String(input);
        idempotencyKey = new Headers(init?.headers).get("idempotency-key") ?? "";
        return Promise.resolve(Response.json({ status: "ok" }));
      }) as typeof fetch;

      render(<BookingActions bookingId="booking/one" status={scenario.status} />);
      fireEvent.click(screen.getByTestId(`booking-${scenario.action}`));

      await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
      expect(calledUrl).toBe(`/api/booking/bookings/booking%2Fone/${scenario.action}`);
      expect(idempotencyKey).toBeTruthy();
    });
  }

  it("shows a safe action error without refreshing", async () => {
    global.fetch = (() => Promise.resolve(Response.json({ message: "Reference service unavailable" }, { status: 503 }))) as typeof fetch;

    render(<BookingActions bookingId="booking-1" status="DRAFT" />);
    fireEvent.click(screen.getByTestId("booking-validate"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Reference service unavailable");
    expect(refresh).not.toHaveBeenCalled();
  });
});
