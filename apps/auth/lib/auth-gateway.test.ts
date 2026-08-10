import { describe, expect, it } from "vitest";
import { SESSION_COOKIE_NAME, encodeSessionCookie, type AuthSession } from "@erp/auth";
import {
  canonicalAuthReturnUrl,
  gatewayEntryHref,
  gatewaySignInHref,
  identityServiceAvailable,
  resolveGatewayDestination,
  resolveGatewaySession
} from "./auth-gateway";

describe("Auth Gateway state", () => {
  it("normalizes legacy singular Booking destinations", () => {
    expect(canonicalAuthReturnUrl("/booking")).toBe("/bookings");
    expect(canonicalAuthReturnUrl("/booking/booking-1?tab=pricing"))
      .toBe("/bookings/booking-1?tab=pricing");
    expect(canonicalAuthReturnUrl("/booking-assets/_next/app.js"))
      .toBe("/booking-assets/_next/app.js");
  });

  it("maps supported ERP destinations to business labels", () => {
    expect(resolveGatewayDestination("/bookings/booking-1?tab=pricing")).toEqual({
      href: "/bookings/booking-1?tab=pricing",
      label: "Bookings",
      invalid: false
    });
    expect(resolveGatewayDestination("/charge-agreements")).toMatchObject({
      label: "Service Contracts & Rates",
      invalid: false
    });
    expect(resolveGatewayDestination("/container-movement/journey-1")).toMatchObject({
      label: "Equipment Journeys",
      invalid: false
    });
  });

  it("rejects external and unknown internal destinations", () => {
    expect(resolveGatewayDestination("https://attacker.example")).toEqual({
      href: "/",
      label: "LinerCore workspace",
      invalid: true
    });
    expect(resolveGatewayDestination("/admin/internal")).toEqual({
      href: "/",
      label: "LinerCore workspace",
      invalid: true
    });
  });

  it("distinguishes active, expired, and missing sessions", () => {
    const active = testSession("2099-07-27T00:00:00Z");
    const expired = testSession("2026-07-01T00:00:00Z");

    expect(resolveGatewaySession(`${SESSION_COOKIE_NAME}=${encodeSessionCookie(active)}`)).toMatchObject({
      kind: "active"
    });
    expect(resolveGatewaySession(`${SESSION_COOKIE_NAME}=${encodeSessionCookie(expired)}`)).toEqual({
      kind: "expired"
    });
    expect(resolveGatewaySession(null)).toEqual({ kind: "signed-out" });
  });

  it("builds sign-in actions through the Auth edge route", () => {
    expect(gatewaySignInHref("/bookings")).toBe("/auth/api/auth/sign-in?returnUrl=%2Fbookings");
    expect(gatewayEntryHref("/bookings")).toBe("/auth/?returnUrl=%2Fbookings");
  });

  it("reports identity service availability without exposing its response", async () => {
    const available = await identityServiceAvailable(
      (() => Promise.resolve(Response.json({ status: "UP" }))) as typeof fetch
    );
    const unavailable = await identityServiceAvailable(
      (() => Promise.resolve(new Response(null, { status: 503 }))) as typeof fetch
    );

    expect(available).toBe(true);
    expect(unavailable).toBe(false);
  });
});

function testSession(expiresAt: string): AuthSession {
  return {
    sessionId: "session-1",
    subjectId: "local.booking.user",
    subjectType: "user",
    displayName: "Booking Operator",
    roles: ["booking-desk"],
    permissions: ["booking:read"],
    issuedAt: "2026-07-01T00:00:00Z",
    expiresAt,
    policyVersion: "keycloak:linercore-local"
  };
}
