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
        const statuses = { validate: "VALIDATED", price: "PRICED", confirm: "CONFIRMED" } as const;
        return Promise.resolve(Response.json({ status: statuses[scenario.action] }));
      }) as typeof fetch;

      render(<BookingActions bookingId="booking/one" status={scenario.status} />);
      fireEvent.click(screen.getByTestId(`booking-${scenario.action}`));

      await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
      const statuses = { validate: "VALIDATED", price: "PRICED", confirm: "CONFIRMED" } as const;
      expect(screen.getByTestId("booking-authoritative-status")).toHaveTextContent(statuses[scenario.action]);
      expect(calledUrl).toBe(`/api/booking/bookings/booking%2Fone/${scenario.action}`);
      expect(idempotencyKey).toBeTruthy();
    });
  }

  it("shows a degraded action with an explicit safe retry without refreshing", async () => {
    global.fetch = (() => Promise.resolve(Response.json({ message: "Reference service unavailable" }, { status: 503 }))) as typeof fetch;

    render(<BookingActions bookingId="booking-1" status="DRAFT" />);
    fireEvent.click(screen.getByTestId("booking-validate"));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Reference service unavailable"));
    expect(screen.getByRole("button", { name: "Retry Validate references" })).toBeTruthy();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("does not offer blind retry for validation-blocked or denied outcomes", async () => {
    global.fetch = (() => Promise.resolve(Response.json({ message: "Correct the route" }, { status: 422 }))) as typeof fetch;
    render(<BookingActions bookingId="booking-1" status="DRAFT" />);
    fireEvent.click(screen.getByTestId("booking-validate"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Correct the route");
    expect(screen.queryByText(/Retry/)).toBeNull();
  });

  it("prevents duplicate commands while one request is pending", async () => {
    let resolveResponse: ((value: Response) => void) | undefined;
    const pending = new Promise<Response>((resolve) => { resolveResponse = resolve; });
    const fetchMock = vi.fn(() => pending);
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<BookingActions bookingId="booking-1" status="DRAFT" />);
    const validate = screen.getByTestId("booking-validate");
    fireEvent.click(validate);
    fireEvent.click(validate);
    expect(fetchMock).toHaveBeenCalledOnce();
    resolveResponse?.(Response.json({ status: "VALIDATED" }));
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  });

  it("does not report success for a false 2xx or unknown confirm status", async () => {
    global.fetch = (() => Promise.resolve(Response.json({ status: "UNKNOWN" }))) as typeof fetch;
    render(<BookingActions bookingId="booking-1" status="PRICED" />);
    fireEvent.click(screen.getByTestId("booking-confirm"));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("without authoritative CONFIRMED status"));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("settles a thrown transport failure and reuses the idempotency key on retry", async () => {
    const keys: string[] = [];
    global.fetch = vi.fn((_input, init) => {
      keys.push(new Headers(init?.headers).get("idempotency-key") ?? "");
      return keys.length === 1
        ? Promise.reject(new Error("offline"))
        : Promise.resolve(Response.json({ status: "VALIDATED" }));
    }) as unknown as typeof fetch;
    render(<BookingActions bookingId="booking-1" status="DRAFT" />);
    fireEvent.click(screen.getByTestId("booking-validate"));
    const retry = await screen.findByTestId("booking-action-retry");
    expect(document.activeElement).toBe(retry.closest("[role=status]"));
    fireEvent.click(retry);
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
  });
});
