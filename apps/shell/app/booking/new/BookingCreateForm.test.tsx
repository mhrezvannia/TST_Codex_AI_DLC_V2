import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingCreateForm } from "./BookingCreateForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

describe("Shell BookingCreateForm", () => {
  it("focuses the error summary for invalid fields", async () => {
    render(<BookingCreateForm />);

    fireEvent.click(screen.getByTestId("booking-submit"));

    const summary = await screen.findByText("Booking not created");
    await waitFor(() => expect(document.activeElement).toBe(summary.parentElement));
    expect(screen.getAllByRole("link", { name: "Required" })[0].getAttribute("href")).toBe("#booking-customerId");
  });

  it("submits to the shell BFF and redirects to canonical shell detail", async () => {
    const originalFetch = global.fetch;
    global.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/booking/reference-options")) {
        return Promise.resolve(Response.json([]));
      }
      expect(url).toBe("/api/booking/bookings");
      expect(new Headers(init?.headers).get("idempotency-key")).toBeTruthy();
      return Promise.resolve(Response.json({ id: "booking-1" }, { status: 201 }));
    }) as typeof fetch;

    try {
      render(<BookingCreateForm />);
      fireEvent.change(screen.getByTestId("booking-customerId"), { target: { value: "customer-1" } });
      fireEvent.change(screen.getByTestId("booking-loadUnLocode"), { target: { value: "USNYC" } });
      fireEvent.change(screen.getByTestId("booking-dischargeUnLocode"), { target: { value: "NLRTM" } });
      fireEvent.change(screen.getByTestId("booking-voyageId"), { target: { value: "voyage-1" } });
      fireEvent.change(screen.getByTestId("booking-equipmentTypeCode"), { target: { value: "45G1" } });
      fireEvent.change(screen.getByTestId("booking-equipmentId"), { target: { value: "MSCU6639870" } });
      fireEvent.change(screen.getByTestId("booking-commodityCode"), { target: { value: "GENERAL" } });
      fireEvent.click(screen.getByTestId("booking-submit"));

      await waitFor(() => expect(push).toHaveBeenCalledWith("/booking/booking-1?created=1"));
    } finally {
      global.fetch = originalFetch;
      push.mockReset();
    }
  });
});
