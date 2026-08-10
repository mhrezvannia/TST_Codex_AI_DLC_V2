import { safeReturnUrl } from "@erp/auth";
import { authenticatedSubjectFromCookie, hasCapability } from "./session";
import {
  CHARGE_BASE_PATH,
  type AuthenticatedSubject,
  type Capability,
  type SafeReturnUrl
} from "./types";

export type ChargePageAuthDecision =
  | Readonly<{ kind: "ALLOW"; subject: AuthenticatedSubject }>
  | Readonly<{ kind: "REDIRECT"; location: string }>
  | Readonly<{ kind: "DENY" }>;

export function authorizeChargePage(
  cookieHeader: string | null | undefined,
  requestedPath: string | null | undefined,
  requiredCapability: Capability
): ChargePageAuthDecision {
  const subject = authenticatedSubjectFromCookie(cookieHeader);
  if (!subject) {
    const returnUrl = safeChargeReturnUrl(requestedPath);
    return Object.freeze({
      kind: "REDIRECT",
      location: `/auth/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`
    });
  }
  return hasCapability(subject, requiredCapability)
    ? Object.freeze({ kind: "ALLOW", subject })
    : Object.freeze({ kind: "DENY" });
}

export function safeChargeReturnUrl(value: string | null | undefined): SafeReturnUrl {
  const fallback = `${CHARGE_BASE_PATH}/`;
  if (!value || value.length > 2048 || /[\u0000-\u001f\u007f\\]/.test(value)
    || value.startsWith("//")) {
    return fallback as SafeReturnUrl;
  }
  const sharedSafe = safeReturnUrl(value, fallback);
  if (sharedSafe.length > 2048
    || !(sharedSafe === CHARGE_BASE_PATH || sharedSafe.startsWith(`${CHARGE_BASE_PATH}/`))) {
    return fallback as SafeReturnUrl;
  }
  return sharedSafe as SafeReturnUrl;
}

export const PAGE_CAPABILITIES = Object.freeze({
  rates: Object.freeze({ resource: "charge-rates", action: "read" }),
  agreements: Object.freeze({ resource: "charge-agreements", action: "read" }),
  manualEvidence: Object.freeze({ resource: "charge-manual-cases", action: "read" })
} satisfies Record<string, Capability>);
