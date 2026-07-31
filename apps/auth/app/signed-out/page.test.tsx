import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import SignedOutPage from "./page";

describe("SignedOutPage", () => {
  test("renders the canonical signed-out confirmation without protected content", async () => {
    render(await SignedOutPage({}));

    expect(screen.getByRole("heading", { name: "You are signed out" })).toBeInTheDocument();
    expect(screen.getByTestId("signed-out-sign-in-link")).toHaveAttribute(
      "href",
      "/auth/?returnUrl=%2F"
    );
    expect(screen.queryByText("local.booking.user")).not.toBeInTheDocument();
    expect(screen.queryByText(/token|cookie/i)).not.toBeInTheDocument();
  });

  test("preserves a safe business destination after expiry", async () => {
    render(
      await SignedOutPage({
        searchParams: Promise.resolve({ reason: "expired", returnUrl: "/bookings/booking-1" })
      })
    );

    expect(screen.getByRole("heading", { name: "Your workspace session ended" })).toBeInTheDocument();
    expect(screen.getByText("Sign in again to continue to Bookings.")).toBeInTheDocument();
    expect(screen.getByTestId("signed-out-sign-in-link")).toHaveAttribute(
      "href",
      "/auth/?returnUrl=%2Fbookings%2Fbooking-1"
    );
  });

  test("neutralizes an unsafe return destination", async () => {
    render(
      await SignedOutPage({
        searchParams: Promise.resolve({ reason: "invalid", returnUrl: "//attacker.example" })
      })
    );

    expect(screen.getByText("We couldn't use the previous destination.")).toBeInTheDocument();
    expect(screen.getByTestId("signed-out-sign-in-link")).toHaveAttribute(
      "href",
      "/auth/?returnUrl=%2F"
    );
  });

  test("uses a POST retry when sign-out did not complete", async () => {
    render(
      await SignedOutPage({
        searchParams: Promise.resolve({ reason: "failed" })
      })
    );

    const retry = screen.getByTestId("signed-out-retry-link");
    expect(retry).toHaveTextContent("Try sign out again");
    expect(retry.closest("form")).toHaveAttribute("action", "/auth/api/auth/sign-out");
    expect(retry.closest("form")).toHaveAttribute("method", "post");
  });
});
