import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingCreateForm } from "./BookingCreateForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() })
}));

describe("BookingCreateForm", () => {
  it("focuses a linked error summary for invalid fields", async () => {
    render(<BookingCreateForm />);

    fireEvent.click(screen.getByTestId("booking-submit"));

    const summary = await screen.findByText("Booking not created");
    await waitFor(() => expect(document.activeElement).toBe(summary.parentElement));
    const customerLink = screen.getAllByRole("link", { name: "Required" })[0];
    expect(customerLink.getAttribute("href")).toBe("#booking-customerId");
  });
});
