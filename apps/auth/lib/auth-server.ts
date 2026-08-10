import {
  createCorrelationId,
  decodeSignedCookie,
  encodeSignedCookie,
  isAuthBypassEnabled as sharedIsAuthBypassEnabled,
  sessionFromCookieHeader,
  toSessionSummary,
  type AuthSession,
  type OidcTransaction,
  type SessionSummary
} from "@erp/auth";
import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { canonicalAuthReturnUrl } from "./auth-gateway";

const keycloakRealm = process.env.KEYCLOAK_REALM ?? "linercore-local";
const keycloakBaseUrl = process.env.KEYCLOAK_PUBLIC_URL ?? "http://keycloak:8080";
const keycloakRealmUrl = `${keycloakBaseUrl}/realms/${keycloakRealm}`;
const keycloakInternalBaseUrl = process.env.KEYCLOAK_INTERNAL_URL ?? keycloakBaseUrl;
const keycloakInternalRealmUrl = `${keycloakInternalBaseUrl}/realms/${keycloakRealm}`;
const authRedirectUri = process.env.AUTH_REDIRECT_URI ?? process.env.KEYCLOAK_CALLBACK_URL ?? "http://localhost:3000/api/auth/callback";

export const authConfig = {
  keycloakRealm,
  keycloakIssuer: process.env.JWT_ISSUER_URI ?? keycloakRealmUrl,
  keycloakAuthorizeUrl: process.env.KEYCLOAK_AUTHORIZE_URL ?? `${keycloakRealmUrl}/protocol/openid-connect/auth`,
  keycloakLogoutUrl: process.env.KEYCLOAK_LOGOUT_URL ?? `${keycloakRealmUrl}/protocol/openid-connect/logout`,
  keycloakTokenUrl: process.env.KEYCLOAK_TOKEN_URL ?? `${keycloakInternalRealmUrl}/protocol/openid-connect/token`,
  keycloakJwksUrl: process.env.KEYCLOAK_JWKS_URL ?? `${keycloakInternalRealmUrl}/protocol/openid-connect/certs`,
  clientId: process.env.AUTH_CLIENT_ID ?? "linercore-auth",
  redirectUri: authRedirectUri,
  publicOrigin: process.env.AUTH_PUBLIC_ORIGIN ?? new URL(authRedirectUri).origin,
  serviceIdentityClientId: process.env.IDENTITY_SERVICE_CLIENT_ID ?? "linercore-identity-service"
};

const keycloakJwks = createRemoteJWKSet(new URL(authConfig.keycloakJwksUrl));

type KeycloakClaims = JWTPayload & {
  email?: string;
  name?: string;
  nonce?: string;
  preferred_username?: string;
  realm_access?: { roles?: string[] };
  resource_access?: Record<string, { roles?: string[] }>;
  sid?: string;
};

const SUPERUSER_PERMISSIONS = [
  "reference-data:read",
  "reference-data:create",
  "reference-data:update",
  "reference-data:deactivate",
  "reference-data:reactivate",
  "booking:read",
  "booking:create",
  "booking:validate",
  "booking:request-pricing",
  "booking:confirm",
  "booking:amend",
  "booking:reconfirm",
  "charge-agreement:read",
  "charge-rates:read",
  "charge-rates:create",
  "charge-rates:update",
  "charge-rates:approve",
  "charge-rates:create-successor",
  "charge-agreements:read",
  "charge-agreements:create",
  "charge-agreements:update",
  "charge-agreements:approve",
  "charge-agreements:create-successor",
  "charge-agreements:suspend",
  "charge-agreements:expire",
  "charge-manual-cases:read",
  "reference-contracts:read",
  "identity-roles:read",
  "identity-roles:assign",
  "identity-roles:revoke",
  "identity-audit:read",
  "platform-status:read"
] as const;

function permissionsForRoles(roles: string[]): string[] {
  if (roles.includes("superuser")) {
    return [...SUPERUSER_PERMISSIONS];
  }
  return [
    ...(roles.includes("booking-desk") ? ["booking:read", "booking:create"] : []),
    ...(roles.includes("reference-admin") ? ["reference-data:read", "reference-data:create"] : []),
    ...(roles.includes("pricing") ? [
      "charge-agreement:read",
      "charge-agreements:read",
      "charge-agreements:create",
      "charge-agreements:update",
      "charge-agreements:approve",
      "charge-agreements:create-successor",
      "charge-agreements:suspend",
      "charge-agreements:expire",
      "charge-rates:read",
      "charge-rates:create",
      "charge-rates:update",
      "charge-rates:approve",
      "charge-rates:create-successor",
      "charge-manual-cases:read"
    ] : [])
  ];
}

export function isAuthBypassEnabled(): boolean {
  return sharedIsAuthBypassEnabled();
}

export function encodeCookie<T>(value: T): string {
  return encodeSignedCookie(value);
}

export function decodeCookie<T>(value: string | undefined): T | null {
  return decodeSignedCookie<T>(value);
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
    pkceVerifier: randomBytes(32).toString("base64url"),
    returnUrl: canonicalAuthReturnUrl(returnUrl),
    createdAt: new Date().toISOString()
  };
}

export function createPkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export async function exchangeAuthorizationCode(code: string, verifier: string): Promise<string> {
  const body = new URLSearchParams({
    client_id: authConfig.clientId,
    code,
    code_verifier: verifier,
    grant_type: "authorization_code",
    redirect_uri: authConfig.redirectUri
  });
  const response = await fetch(authConfig.keycloakTokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) {
    throw new Error(`Keycloak token exchange failed with HTTP ${response.status}`);
  }
  const tokenSet = await response.json() as { id_token?: unknown };
  if (typeof tokenSet.id_token !== "string") {
    throw new Error("Keycloak token response did not include an ID token");
  }
  return tokenSet.id_token;
}

export async function verifyOidcIdToken(idToken: string, expectedNonce: string): Promise<KeycloakClaims> {
  const { payload } = await jwtVerify(idToken, keycloakJwks, {
    issuer: authConfig.keycloakIssuer,
    audience: authConfig.clientId,
    algorithms: ["RS256"]
  });
  if (payload.nonce !== expectedNonce) {
    throw new Error("OIDC nonce mismatch");
  }
  return payload as KeycloakClaims;
}

export function createOidcSession(claims: KeycloakClaims): AuthSession {
  if (!claims.sub) {
    throw new Error("OIDC ID token is missing subject");
  }
  const roles = Array.from(new Set([
    ...(claims.realm_access?.roles ?? []),
    ...(claims.resource_access?.[authConfig.clientId]?.roles ?? [])
  ])).filter((role) => !role.startsWith("default-roles-"));
  const permissions = permissionsForRoles(roles);
  const issuedAt = new Date((claims.iat ?? Math.floor(Date.now() / 1000)) * 1000);
  const expiresAt = new Date((claims.exp ?? Math.floor(Date.now() / 1000) + 300) * 1000);
  return {
    sessionId: claims.sid ?? claims.jti ?? createCorrelationId(),
    subjectId: claims.sub,
    subjectType: "user",
    displayName: claims.name ?? claims.preferred_username ?? claims.sub,
    email: claims.email,
    roles,
    permissions,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    policyVersion: `keycloak:${authConfig.keycloakRealm}`
  };
}

export function sessionMaxAgeSeconds(session: AuthSession): number {
  const remaining = Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1000);
  return Math.max(1, Math.min(3600, remaining));
}

export function createLocalSession(subjectId: string): AuthSession {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 60 * 60 * 1000);
  const superuser = subjectId === "local.superuser";
  const bookingUser = subjectId === "local.booking.user";
  return {
    sessionId: createCorrelationId(),
    subjectId,
    subjectType: "user",
    displayName: subjectId,
    email: `${subjectId}@example.test`,
    roles: superuser ? ["superuser"] : bookingUser ? ["booking-desk"] : ["reference-admin"],
    permissions: superuser
      ? [...SUPERUSER_PERMISSIONS]
      : bookingUser
        ? ["booking:read", "booking:create"]
        : ["reference-data:read", "reference-data:create"],
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    policyVersion: "mvp-2026-07-01"
  };
}

export function localSubjectId(requested?: string | null): string {
  const allowedSubjects = new Set(["local.superuser", "local.booking.user", "local.reference.admin", "local-user"]);
  if (requested && allowedSubjects.has(requested)) {
    return requested;
  }
  return process.env.AUTH_LOCAL_SUBJECT_ID ?? "local.booking.user";
}

export function sessionFromRequest(request: Request): AuthSession | null {
  return sessionFromCookieHeader(request.headers.get("cookie"));
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

export function publicUrl(request: Request, path: string): URL {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "http";
  if (forwardedHost) return new URL(path, `${forwardedProto}://${forwardedHost}`);
  return new URL(path, new URL(request.url).origin || authConfig.publicOrigin);
}
