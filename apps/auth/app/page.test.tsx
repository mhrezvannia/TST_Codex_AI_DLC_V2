import { render, screen } from "@testing-library/react";
import { headers } from "next/headers";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { SESSION_COOKIE_NAME, encodeSessionCookie, type AuthSession } from "@erp/auth";
import AuthHomePage from "./page";

vi.mock("next/headers", () => ({
  headers: vi.fn()
}));

const originalFetch = global.fetch;

beforeEach(() => {
  vi.mocked(headers).mockResolvedValue(new Headers({ "x-correlation-id": "request-1" }) as never);
  global.fetch = vi.fn(() => Promise.resolve(Response.json({ status: "UP" })));
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.clearAllMocks();
});

test("renders a signed-out product entry with the auth edge prefix", async () => {
  render(await AuthHomePage({ searchParams: Promise.resolve({ returnUrl: "/bookings" }) }));

  expect(screen.getByRole("heading", { name: "Sign in to LinerCore" })).toBeInTheDocument();
  expect(screen.getByText("After sign-in, you'll continue to Bookings.")).toBeInTheDocument();
  expect(screen.getByTestId("auth-start-link")).toHaveAttribute(
    "href",
    "/auth/api/auth/sign-in?returnUrl=%2Fbookings"
  );
  expect(screen.getByText("Technical details").closest("details")).not.toHaveAttribute("open");
  expect(screen.queryByText("BFF guarded")).not.toBeInTheDocument();
});

test("routes an active session back to the requested workspace", async () => {
  vi.mocked(headers).mockResolvedValue(
    new Headers({
      cookie: `${SESSION_COOKIE_NAME}=${encodeSessionCookie(testSession())}`,
      "x-correlation-id": "request-2"
    }) as never
  );

  render(await AuthHomePage({ searchParams: Promise.resolve({ returnUrl: "/bookings" }) }));

  expect(screen.getByRole("heading", { name: "Welcome back, Booking Operator" })).toBeInTheDocument();
  expect(screen.getByTestId("auth-start-link")).toHaveTextContent("Continue to Bookings");
  expect(screen.getByTestId("auth-start-link")).toHaveAttribute("href", "/bookings");
});

test("falls back safely from an external return destination", async () => {
  render(await AuthHomePage({ searchParams: Promise.resolve({ returnUrl: "https://attacker.example/steal" }) }));

  expect(screen.getByText("We couldn't use that destination.")).toBeInTheDocument();
  expect(screen.getByTestId("auth-start-link")).toHaveAttribute(
    "href",
    "/auth/api/auth/sign-in?returnUrl=%2F"
  );
});

test("shows a recoverable identity-service unavailable state", async () => {
  global.fetch = vi.fn(() => Promise.resolve(new Response(null, { status: 503 })));

  render(await AuthHomePage({ searchParams: Promise.resolve({ returnUrl: "/bookings" }) }));

  expect(
    screen.getByRole("heading", { name: "Workspace access is temporarily unavailable" })
  ).toBeInTheDocument();
  expect(screen.getByTestId("auth-start-link")).toHaveTextContent("Try again");
  expect(screen.getByTestId("auth-start-link")).toHaveAttribute("href", "/auth/?returnUrl=%2Fbookings");
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
    expiresAt: "2099-07-27T00:00:00Z",
    policyVersion: "keycloak:linercore-local"
  };
}
