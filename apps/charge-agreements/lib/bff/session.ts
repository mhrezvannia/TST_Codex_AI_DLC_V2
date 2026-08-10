import {
  createCorrelationId,
  parsePermission,
  sessionFromCookieHeader,
  sessionFromRequest,
  type AuthSession
} from "@erp/auth";
import type { AuthenticatedSubject, Capability } from "./types";

export function authenticatedSubjectFromRequest(request: Request): AuthenticatedSubject | null {
  return authenticatedSubjectFromSession(sessionFromRequest(request));
}

export function authenticatedSubjectFromCookie(
  cookieHeader: string | null | undefined
): AuthenticatedSubject | null {
  return authenticatedSubjectFromSession(sessionFromCookieHeader(cookieHeader));
}

export function authenticatedSubjectFromSession(
  session: AuthSession | null
): AuthenticatedSubject | null {
  const subjectId = session?.subjectId?.trim();
  if (!session || !subjectId || (session.subjectType ?? "user") !== "user") return null;
  return Object.freeze({
    subjectId: subjectId.slice(0, 128),
    subjectType: "user",
    displayName: session.displayName.trim().slice(0, 128),
    capabilities: Object.freeze(
      session.permissions.map(parsePermission).map((capability) => Object.freeze(capability))
    )
  });
}

export function hasCapability(
  subject: AuthenticatedSubject,
  required: Capability
): boolean {
  return subject.capabilities.some((candidate) => candidate.resource === required.resource
    && candidate.action === required.action
    && candidate.scope === required.scope);
}

export function sessionCorrelation(value: string | null | undefined): string {
  return value && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)
    ? value : createCorrelationId();
}
