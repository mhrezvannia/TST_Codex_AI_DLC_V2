import {
  actorSubjectFromSession,
  safeReturnUrl,
  sessionFromCookieHeader,
  toSessionSummary,
  type AuthSession,
  type SessionSummary
} from "@erp/auth";

export type ShellSession =
  | { ok: true; session: AuthSession; summary: SessionSummary; actorSubjectId: string }
  | { ok: false; redirectTo: string };

export function authSignInPath(returnUrl: string): string {
  return `/auth/api/auth/sign-in?returnUrl=${encodeURIComponent(safeReturnUrl(returnUrl, "/"))}`;
}
export function requireShellSession(cookieHeader: string | null | undefined, returnUrl: string, correlationId: string): ShellSession {
  const session = sessionFromCookieHeader(cookieHeader);
  const actorSubjectId = actorSubjectFromSession(session);
  if (!session || !actorSubjectId) {
    return { ok: false, redirectTo: authSignInPath(returnUrl) };
  }
  return {
    ok: true,
    session,
    summary: toSessionSummary(session, correlationId),
    actorSubjectId
  };
}
