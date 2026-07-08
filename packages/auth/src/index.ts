export type SessionSummary = {
  isAuthenticated: boolean;
  subject: string;
  subjectId?: string;
  displayName: string;
  email?: string;
  roles: string[];
  permissions?: string[];
  policyVersion?: string;
  correlationId?: string;
};

export const SESSION_COOKIE_NAME = "lc_session";
export const OIDC_TRANSACTION_COOKIE_NAME = "lc_oidc_tx";

export type AuthSession = {
  sessionId: string;
  subjectId: string;
  displayName: string;
  email?: string;
  roles: string[];
  permissions: string[];
  issuedAt: string;
  expiresAt: string;
  policyVersion: string;
};

export type OidcTransaction = {
  state: string;
  nonce: string;
  pkceVerifier: string;
  returnUrl: string;
  createdAt: string;
};

export type AccessDeniedContext = {
  resource: string;
  action?: string;
  reasonCode: string;
  message: string;
  correlationId: string;
  requestAccessAllowed: boolean;
};

export type RequestAccessSubmission = {
  submissionId: string;
  subjectId: string;
  displayName: string;
  email?: string;
  requestedResource: string;
  requestedAction?: string;
  message?: string;
  submittedAt: string;
  correlationId: string;
};

export type AuthError = {
  code: string;
  message: string;
  retryable: boolean;
  correlationId: string;
  occurredAt: string;
};

export function createCorrelationId(): string {
  return crypto.randomUUID();
}

export function isLocalRuntimeProfile(env: Record<string, string | undefined> = process.env): boolean {
  if (env.NODE_ENV === "production") {
    return false;
  }
  const profile = (env.AUTH_RUNTIME_PROFILE ?? env.APP_ENV ?? env.NODE_ENV ?? "development").toLowerCase();
  return ["local", "development", "dev", "test"].includes(profile);
}

export function isLocalBypassEnabled(
  env: Record<string, string | undefined> = process.env,
  flagNames = ["AUTH_BYPASS"]
): boolean {
  return isLocalRuntimeProfile(env) && flagNames.some((name) => env[name] === "true");
}

export function isAuthBypassEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return isLocalBypassEnabled(env, ["AUTH_BYPASS"]);
}

export function safeReturnUrl(value: string | null | undefined, fallback = "/session"): string {
  if (!value || value.trim().length === 0) {
    return fallback;
  }
  try {
    const parsed = new URL(value, "http://internal.local");
    if (parsed.origin !== "http://internal.local") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function redactTokenLikeValues<T extends Record<string, unknown>>(value: T): T {
  const redacted = { ...value };
  for (const key of Object.keys(redacted)) {
    if (/(access|refresh|id)_?token|secret|nonce|pkce/i.test(key)) {
      redacted[key as keyof T] = "[REDACTED]" as T[keyof T];
    }
  }
  return redacted;
}

export function toSessionSummary(session: AuthSession, correlationId: string): SessionSummary {
  return {
    isAuthenticated: true,
    subject: session.subjectId,
    subjectId: session.subjectId,
    displayName: session.displayName,
    email: session.email,
    roles: session.roles,
    permissions: session.permissions,
    policyVersion: session.policyVersion,
    correlationId
  };
}
