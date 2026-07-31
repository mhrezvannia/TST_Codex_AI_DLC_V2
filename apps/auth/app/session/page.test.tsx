import { render, screen } from "@testing-library/react";
import { SESSION_COOKIE_NAME, encodeSessionCookie, type AuthSession } from "@erp/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";
import SessionPage from "./page";

vi.mock("next/headers", () => ({
  headers: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((location: string) => {
    throw new Error(`REDIRECT:${location}`);
  })
}));

describe("SessionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders safe account, role, capability, and expiry facts", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers({
      cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(testSession())}`,
      "x-correlation-id": "corr-session"
    }) as never);

    render(await SessionPage());

    expect(screen.getByRole("heading", { name: "Account and session" })).toBeInTheDocument();
    expect(screen.getByText("Booking Operator")).toBeInTheDocument();
    expect(screen.getByText("Booking Desk")).toBeInTheDocument();
    expect(screen.getByText("Bookings: Read")).toBeInTheDocument();
    expect(screen.getByTestId("session-json-link")).toHaveAttribute("href", "/auth/api/auth/session");
    expect(screen.getByTestId("sign-out-button").closest("form")).toHaveAttribute(
      "action",
      "/auth/api/auth/sign-out"
    );
  });

  test("redirects a missing session before account facts render", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers() as never);

    await expect(SessionPage()).rejects.toThrow("REDIRECT:/auth/signed-out?reason=invalid&returnUrl=%2F");
    expect(redirect).toHaveBeenCalled();
  });
});

function testSession(): AuthSession {
  return {
    sessionId: "session-1",
    subjectId: "local.booking.user",
    subjectType: "user",
    displayName: "Booking Operator",
    roles: ["booking-desk"],
    permissions: ["booking:read"],
    issuedAt: "2026-07-27T00:00:00Z",
    expiresAt: "2099-07-27T01:00:00Z",
    policyVersion: "keycloak:linercore-local"
  };
}
