import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ShellSignedOutPage from "./page";

describe("ShellSignedOutPage", () => {
  it("renders a stable signed-out state without stale identity or Booking data", () => {
    render(<ShellSignedOutPage />);

    expect(screen.getByTestId("shell-signed-out-page")).toHaveTextContent("Signed out");
    expect(screen.getByTestId("shell-signed-out-sign-in").getAttribute("href")).toBe("/auth/sign-in");
    expect(screen.queryByTestId("shell-user-menu")).not.toBeInTheDocument();
    expect(screen.queryByTestId("shell-booking-list")).not.toBeInTheDocument();
    expect(screen.queryByText("local.booking.user")).not.toBeInTheDocument();
  });
});
