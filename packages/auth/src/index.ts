import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionSummary = {
  isAuthenticated: boolean;
  subject: string;
  subjectId?: string;
  subjectType?: SubjectType;
  displayName: string;
  email?: string;
  roles: string[];
  permissions?: string[];
  permissionSummary?: PermissionSummary;
  policyVersion?: string;
  issuedAt?: string;
  expiresAt?: string;
  correlationId?: string;
};

export const SESSION_COOKIE_NAME = "lc_session";
export const OIDC_TRANSACTION_COOKIE_NAME = "lc_oidc_tx";

export type AuthSession = {
  sessionId: string;
  subjectId: string;
  subjectType?: SubjectType;
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

export type SubjectType = "user" | "service";

export type Capability = {
  resource: string;
  action: string;
  scope?: string;
};

export type PermissionSummary = {
  total: number;
  byResource: Record<string, string[]>;
};

export type AuthenticatedSubject = {
  subjectId: string;
  subjectType: SubjectType;
  displayName: string;
  email?: string;
  issuer?: string;
  tenantOrCarrierCode?: string;
  capabilities: Capability[];
};

export type AuthorizationRequest = {
  subject: AuthenticatedSubject | null;
  resource: string;
  action: string;
  scope?: string;
  correlationId: string;
};

export type AuthorizationDecision = {
  result: "ALLOW" | "DENY";
  reasonCode: "ALLOW" | "DENY_UNKNOWN_SUBJECT" | "DENY_NO_PERMISSION";
  subjectId?: string;
  subjectType?: SubjectType;
  resource: string;
  action: string;
  scope?: string;
  correlationId: string;
  decidedAt: string;
};

export function createCorrelationId(): string {
  return crypto.randomUUID();
}

export function isLocalRuntimeProfile(env: Record<string, string | undefined> = process.env): boolean {
  const productionLike = [env.NODE_ENV, env.APP_ENV, env.AUTH_RUNTIME_PROFILE]
    .filter(Boolean)
    .some((value) => /^(prod|production|stage|staging)$/i.test(value ?? ""));
  if (productionLike) {
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
  return redactRecord(value) as T;
}

export function createUserSubject(input: Omit<AuthenticatedSubject, "subjectType">): AuthenticatedSubject {
  return { ...input, subjectType: "user" };
}

export function createServiceSubject(input: Omit<AuthenticatedSubject, "subjectType" | "email">): AuthenticatedSubject {
  return { ...input, subjectType: "service" };
}

export function parsePermission(value: string): Capability {
  const [resource, action = "read", scope] = value.split(":");
  return { resource, action, scope };
}

export function summarizePermissions(permissions: string[]): PermissionSummary {
  const byResource: Record<string, string[]> = {};
  for (const permission of permissions) {
    const capability = parsePermission(permission);
    byResource[capability.resource] = [...new Set([...(byResource[capability.resource] ?? []), capability.action])].sort();
  }
  return { total: permissions.length, byResource };
}

export function hasCapability(subject: AuthenticatedSubject, required: Capability): boolean {
  return subject.capabilities.some((capability) => capability.resource === required.resource
    && capability.action === required.action
    && (!capability.scope || !required.scope || capability.scope === required.scope));
}

export function evaluateAuthorization(request: AuthorizationRequest): AuthorizationDecision {
  if (!request.subject) {
    return decision("DENY", "DENY_UNKNOWN_SUBJECT", request);
  }
  if (!hasCapability(request.subject, request)) {
    return decision("DENY", "DENY_NO_PERMISSION", request);
  }
  return decision("ALLOW", "ALLOW", request);
}

export function createAccessDeniedContext(
  decisionValue: AuthorizationDecision,
  message = "Access denied"
): AccessDeniedContext {
  return {
    resource: decisionValue.resource,
    action: decisionValue.action,
    reasonCode: decisionValue.reasonCode,
    message,
    correlationId: decisionValue.correlationId,
    requestAccessAllowed: decisionValue.subjectType !== "service"
  };
}

function decision(
  result: AuthorizationDecision["result"],
  reasonCode: AuthorizationDecision["reasonCode"],
  request: AuthorizationRequest
): AuthorizationDecision {
  return {
    result,
    reasonCode,
    subjectId: request.subject?.subjectId,
    subjectType: request.subject?.subjectType,
    resource: request.resource,
    action: request.action,
    scope: request.scope,
    correlationId: request.correlationId,
    decidedAt: new Date().toISOString()
  };
}

function redactRecord(value: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = { ...value };
  for (const key of Object.keys(redacted)) {
    if (/(access|refresh|id)_?token|secret|nonce|pkce/i.test(key)) {
      redacted[key] = "[REDACTED]";
      continue;
    }
    const current = redacted[key];
    if (Array.isArray(current)) {
      redacted[key] = current.map((entry) => typeof entry === "object" && entry !== null
        ? redactRecord(entry as Record<string, unknown>)
        : entry);
    } else if (typeof current === "object" && current !== null) {
      redacted[key] = redactRecord(current as Record<string, unknown>);
    }
  }
  return redacted;
}

export function toSessionSummary(session: AuthSession, correlationId: string): SessionSummary {
  return {
    isAuthenticated: true,
    subject: session.subjectId,
    subjectId: session.subjectId,
    subjectType: session.subjectType ?? "user",
    displayName: session.displayName,
    email: session.email,
    roles: session.roles,
    permissions: session.permissions,
    permissionSummary: summarizePermissions(session.permissions),
    policyVersion: session.policyVersion,
    issuedAt: session.issuedAt,
    expiresAt: session.expiresAt,
    correlationId
  };
}

export function resolveCookieSigningSecret(
  env: Record<string, string | undefined> = process.env
): string {
  const configured = env.AUTH_SESSION_SECRET?.trim();
  if (configured) {
    return configured;
  }
  if (isLocalRuntimeProfile(env)) {
    return "linercore-local-session-secret";
  }
  throw new Error("AUTH_SESSION_SECRET is required outside local and test profiles");
}

export function encodeSignedCookie<T>(value: T, secret?: string): string {
  const payload = Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
  const signature = createHmac("sha256", secret ?? resolveCookieSigningSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function decodeSignedCookie<T>(value: string | undefined, secret?: string): T | null {
  if (!value) {
    return null;
  }
  try {
    const [payload, signature, extra] = value.split(".");
    if (!payload || !signature || extra) {
      return null;
    }
    const expected = createHmac("sha256", secret ?? resolveCookieSigningSecret()).update(payload).digest();
    const supplied = Buffer.from(signature, "base64url");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      return null;
    }
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function encodeSessionCookie(session: AuthSession, secret?: string): string {
  return encodeSignedCookie(session, secret);
}

export function decodeSessionCookie(value: string | undefined, secret?: string): AuthSession | null {
  return decodeSignedCookie<AuthSession>(value, secret);
}

export function readCookieValue(header: string | null | undefined, name: string): string | undefined {
  return header
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function isSessionExpired(session: AuthSession, now = new Date()): boolean {
  const expiresAt = Date.parse(session.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= now.getTime();
}

export function sessionFromCookieHeader(cookieHeader: string | null | undefined): AuthSession | null {
  const session = decodeSessionCookie(readCookieValue(cookieHeader, SESSION_COOKIE_NAME));
  return session && !isSessionExpired(session) ? session : null;
}

export function sessionFromRequest(request: Request): AuthSession | null {
  return sessionFromCookieHeader(request.headers.get("cookie"));
}

export function safeSessionSummaryFromRequest(request: Request, correlationId = createCorrelationId()): SessionSummary {
  const session = sessionFromRequest(request);
  if (!session) {
    return {
      isAuthenticated: false,
      subject: "",
      subjectType: "user",
      displayName: "",
      roles: [],
      permissions: [],
      permissionSummary: { total: 0, byResource: {} },
      correlationId
    };
  }
  return toSessionSummary(session, correlationId);
}

export function actorSubjectFromSession(session: AuthSession | null | undefined): string | null {
  const subject = session?.subjectId?.trim();
  return subject ? subject : null;
}

export function actorSubjectFromRequest(request: Request): string | null {
  return actorSubjectFromSession(sessionFromRequest(request));
}
