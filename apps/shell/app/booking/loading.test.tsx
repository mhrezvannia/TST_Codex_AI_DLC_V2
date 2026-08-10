import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BookingLoading from "./loading";

describe("BookingLoading", () => {
  it("announces the busy loading state politely", () => {
    render(<BookingLoading />);

    const loading = screen.getByRole("region", { name: "Loading bookings" });
    expect(loading).toHaveAttribute("aria-busy", "true");
    expect(loading).toHaveAttribute("aria-live", "polite");
  });
});
