import {
  SESSION_COOKIE_NAME,
  createCorrelationId,
  isAuthBypassEnabled as sharedIsAuthBypassEnabled,
  safeReturnUrl,
  toSessionSummary,
  type AuthSession,
  type OidcTransaction,
  type SessionSummary
} from "@erp/auth";

const keycloakRealm = process.env.KEYCLOAK_REALM ?? "linercore-local";
const keycloakBaseUrl = process.env.KEYCLOAK_PUBLIC_URL ?? "http://keycloak:8080";
const keycloakRealmUrl = `${keycloakBaseUrl}/realms/${keycloakRealm}`;

export const authConfig = {
  keycloakRealm,
  keycloakIssuer: process.env.JWT_ISSUER_URI ?? keycloakRealmUrl,
  keycloakAuthorizeUrl: process.env.KEYCLOAK_AUTHORIZE_URL ?? `${keycloakRealmUrl}/protocol/openid-connect/auth`,
  keycloakLogoutUrl: process.env.KEYCLOAK_LOGOUT_URL ?? `${keycloakRealmUrl}/protocol/openid-connect/logout`,
  clientId: process.env.AUTH_CLIENT_ID ?? "linercore-auth",
  redirectUri: process.env.AUTH_REDIRECT_URI ?? process.env.KEYCLOAK_CALLBACK_URL ?? "http://localhost:3000/api/auth/callback",
  serviceIdentityClientId: process.env.IDENTITY_SERVICE_CLIENT_ID ?? "linercore-identity-service"
};

export function isAuthBypassEnabled(): boolean {
  return sharedIsAuthBypassEnabled();
}

export function encodeCookie<T>(value: T): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function decodeCookie<T>(value: string | undefined): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function readCookie(header: string | null, name: string): string | undefined {
  return header?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function createOidcTransaction(returnUrl: string): OidcTransaction {
  return {
    state: createCorrelationId(),
    nonce: createCorrelationId(),
    pkceVerifier: createCorrelationId(),
    returnUrl: safeReturnUrl(returnUrl),
    createdAt: new Date().toISOString()
  };
}

export function createLocalSession(subjectId: string): AuthSession {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 60 * 60 * 1000);
  return {
    sessionId: createCorrelationId(),
    subjectId,
    subjectType: "user",
    displayName: subjectId,
    email: `${subjectId}@example.test`,
    roles: ["reference-admin"],
    permissions: ["reference-data:read", "reference-data:create"],
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    policyVersion: "mvp-2026-07-01"
  };
}

export function sessionFromRequest(request: Request): AuthSession | null {
  const raw = readCookie(request.headers.get("cookie"), SESSION_COOKIE_NAME);
  return decodeCookie<AuthSession>(raw);
}

export function safeSessionSummary(request: Request): SessionSummary {
  const correlationId = request.headers.get("x-correlation-id") ?? createCorrelationId();
  const session = sessionFromRequest(request) ?? (isAuthBypassEnabled() ? createLocalSession("local-user") : null);
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

export function setCookieHeader(name: string, value: string, maxAgeSeconds: number): string {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearCookieHeader(name: string): string {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function redirectResponse(location: URL | string, status = 303): Response {
  return new Response(null, {
    status,
    headers: {
      Location: location.toString()
    }
  });
}
