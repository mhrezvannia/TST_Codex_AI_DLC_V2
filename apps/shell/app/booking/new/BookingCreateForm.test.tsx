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

  it("retains valid input and announces a service validation failure", async () => {
    const originalFetch = global.fetch;
    global.fetch = ((input: RequestInfo | URL) => String(input).includes("reference-options")
      ? Promise.resolve(Response.json([]))
      : Promise.resolve(Response.json({ message: "Customer is not active", fields: { customerId: "Customer is not active" } }, { status: 422 }))) as typeof fetch;
    try {
      render(<BookingCreateForm />);
      for (const [testId, value] of [
        ["booking-customerId", "customer-1"], ["booking-loadUnLocode", "USNYC"],
        ["booking-dischargeUnLocode", "NLRTM"], ["booking-voyageId", "voyage-1"],
        ["booking-equipmentTypeCode", "45G1"], ["booking-equipmentId", "MSCU6639870"],
        ["booking-commodityCode", "GENERAL"]
      ]) fireEvent.change(screen.getByTestId(testId), { target: { value } });
      fireEvent.click(screen.getByTestId("booking-submit"));
      expect(await screen.findByRole("alert")).toHaveTextContent("Customer is not active");
      expect((screen.getByTestId("booking-customerId") as HTMLInputElement).value).toBe("customer-1");
      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("alert")));
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("retains input, focuses recovery, and safely retries a thrown transport failure", async () => {
    const originalFetch = global.fetch;
    let createCalls = 0;
    const keys: string[] = [];
    global.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes("reference-options")) return Promise.resolve(Response.json([]));
      createCalls += 1;
      keys.push(new Headers(init?.headers).get("idempotency-key") ?? "");
      return createCalls === 1 ? Promise.reject(new Error("offline")) : Promise.resolve(Response.json({ id: "booking-2" }, { status: 201 }));
    }) as typeof fetch;
    try {
      render(<BookingCreateForm />);
      for (const [testId, value] of [["booking-customerId", "customer-1"], ["booking-loadUnLocode", "USNYC"], ["booking-dischargeUnLocode", "NLRTM"], ["booking-voyageId", "voyage-1"], ["booking-equipmentTypeCode", "45G1"], ["booking-equipmentId", "MSCU6639870"], ["booking-commodityCode", "GENERAL"]]) fireEvent.change(screen.getByTestId(testId), { target: { value } });
      fireEvent.click(screen.getByTestId("booking-submit"));
      const retry = await screen.findByTestId("booking-create-retry");
      expect(screen.getByTestId("booking-customerId")).toHaveValue("customer-1");
      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("alert")));
      fireEvent.click(retry);
      await waitFor(() => expect(push).toHaveBeenCalledWith("/booking/booking-2?created=1"));
      expect(keys[1]).toBe(keys[0]);
    } finally {
      global.fetch = originalFetch;
      push.mockReset();
    }
  });

  it("classifies denied outcomes without blind retry and offers safe navigation", async () => {
    const originalFetch = global.fetch;
    global.fetch = ((input: RequestInfo | URL) => String(input).includes("reference-options") ? Promise.resolve(Response.json([])) : Promise.resolve(Response.json({ message: "Denied" }, { status: 403 }))) as typeof fetch;
    try {
      render(<BookingCreateForm />);
      for (const [testId, value] of [["booking-customerId", "customer-1"], ["booking-loadUnLocode", "USNYC"], ["booking-dischargeUnLocode", "NLRTM"], ["booking-voyageId", "voyage-1"], ["booking-equipmentTypeCode", "45G1"], ["booking-equipmentId", "MSCU6639870"], ["booking-commodityCode", "GENERAL"]]) fireEvent.change(screen.getByTestId(testId), { target: { value } });
      fireEvent.click(screen.getByTestId("booking-submit"));
      expect(await screen.findByRole("alert")).toHaveTextContent("Denied");
      expect(screen.queryByTestId("booking-create-retry")).toBeNull();
      expect(screen.getByRole("link", { name: "Return safely to Booking" })).toHaveAttribute("href", "/booking");
    } finally { global.fetch = originalFetch; }
  });
});
