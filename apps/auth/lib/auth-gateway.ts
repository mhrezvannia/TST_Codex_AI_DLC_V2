import {
  SESSION_COOKIE_NAME,
  decodeSessionCookie,
  isSessionExpired,
  readCookieValue,
  safeReturnUrl,
  type AuthSession
} from "@erp/auth";

export type GatewayDestination = {
  href: string;
  label: string;
  invalid: boolean;
};

export type GatewaySessionState =
  | { kind: "signed-out" }
  | { kind: "expired" }
  | { kind: "active"; session: AuthSession };

const DESTINATIONS = [
  { prefix: "/bookings", label: "Bookings" },
  { prefix: "/charge-agreements", label: "Service Contracts & Rates" },
  { prefix: "/reference-data", label: "Reference Data" },
  { prefix: "/container-movement", label: "Equipment Journeys" }
] as const;

export function canonicalAuthReturnUrl(value: string | null | undefined): string {
  const safeValue = safeReturnUrl(value, "/");
  if (safeValue === "/booking"
      || safeValue.startsWith("/booking?")
      || safeValue.startsWith("/booking#")
      || safeValue.startsWith("/booking/")) {
    return `/bookings${safeValue.slice("/booking".length)}`;
  }
  return safeValue;
}

export function resolveGatewayDestination(value: string | null | undefined): GatewayDestination {
  if (!value?.trim()) {
    return { href: "/", label: "LinerCore workspace", invalid: false };
  }

  const safeValue = canonicalAuthReturnUrl(value);
  const path = safeValue.split(/[?#]/, 1)[0];
  if (path === "/") {
    return { href: "/", label: "LinerCore workspace", invalid: value.trim() !== "/" };
  }

  const destination = DESTINATIONS.find(({ prefix }) => path === prefix || path.startsWith(`${prefix}/`));
  if (!destination) {
    return { href: "/", label: "LinerCore workspace", invalid: true };
  }

  return { href: safeValue, label: destination.label, invalid: false };
}

export function resolveGatewaySession(cookieHeader: string | null | undefined): GatewaySessionState {
  const cookieValue = readCookieValue(cookieHeader, SESSION_COOKIE_NAME);
  const session = decodeSessionCookie(cookieValue);
  if (!session) return { kind: "signed-out" };
  if (isSessionExpired(session)) return { kind: "expired" };
  return { kind: "active", session };
}

export function gatewaySignInHref(destination: string) {
  return `/auth/api/auth/sign-in?returnUrl=${encodeURIComponent(destination)}`;
}

export function gatewayEntryHref(destination: string) {
  return `/auth/?returnUrl=${encodeURIComponent(destination)}`;
}

export async function identityServiceAvailable(fetcher: typeof fetch = fetch): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);
  const serviceUrl = process.env.IDENTITY_SERVICE_URL ?? "http://identity-service:8082";

  try {
    const response = await fetcher(`${serviceUrl}/actuator/health`, {
      cache: "no-store",
      signal: controller.signal
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
