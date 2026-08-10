import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import SignInPage from "./page";

describe("SignInPage", () => {
  test("renders a business-language handoff through the Auth edge route", async () => {
    render(await SignInPage({ searchParams: Promise.resolve({ returnUrl: "/bookings" }) }));

    expect(screen.getByRole("heading", { name: "Continue to company sign-in" })).toBeInTheDocument();
    expect(screen.getByText("Return to Bookings.")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-button")).toHaveAttribute(
      "href",
      "/auth/api/auth/sign-in?returnUrl=%2Fbookings"
    );
    expect(screen.getByRole("link", { name: "Cancel" })).toHaveAttribute(
      "href",
      "/auth/?returnUrl=%2Fbookings"
    );
    expect(screen.queryByText("Keycloak")).not.toBeInTheDocument();
    expect(screen.queryByText("linercore-platform")).not.toBeInTheDocument();
  });

  test("falls back safely from an external destination", async () => {
    render(
      await SignInPage({
        searchParams: Promise.resolve({ returnUrl: "https://attacker.example/collect" })
      })
    );

    expect(screen.getByText("We couldn't use that destination.")).toBeInTheDocument();
    expect(screen.getByText("Return to LinerCore workspace.")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-button")).toHaveAttribute(
      "href",
      "/auth/api/auth/sign-in?returnUrl=%2F"
    );
  });

  test("renders expired and unavailable recovery states", async () => {
    const { unmount } = render(
      await SignInPage({
        searchParams: Promise.resolve({ returnUrl: "/reference-data", status: "expired" })
      })
    );

    expect(screen.getByRole("heading", { name: "Your sign-in request expired" })).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-button")).toHaveTextContent("Start again");
    unmount();

    render(
      await SignInPage({
        searchParams: Promise.resolve({ returnUrl: "/reference-data", status: "unavailable" })
      })
    );

    expect(screen.getByRole("heading", { name: "Sign-in is temporarily unavailable" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Company sign-in is unavailable");
    expect(screen.getByTestId("sign-in-button")).toHaveAttribute(
      "href",
      "/auth/api/auth/sign-in?returnUrl=%2Freference-data"
    );
  });
});
