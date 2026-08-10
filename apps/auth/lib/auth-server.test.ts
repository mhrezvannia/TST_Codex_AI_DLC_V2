import { SESSION_COOKIE_NAME } from "@erp/auth";
import { POST as signOut } from "../app/api/auth/sign-out/route";
import { authConfig, createLocalSession, createOidcSession, createOidcTransaction, createPkceChallenge, decodeCookie, encodeCookie, isAuthBypassEnabled, localSubjectId, publicUrl, readCookie, safeSessionSummary, setCookieHeader } from "./auth-server";

test("encodes and decodes session cookies", () => {
  const session = createLocalSession("user-1");
  expect(decodeCookie(encodeCookie(session))).toMatchObject({ subjectId: "user-1" });
  expect(decodeCookie(`${encodeCookie(session)}tampered`)).toBeNull();
});

test("reads safe session summary from cookie", () => {
  const session = createLocalSession("user-1");
  const cookie = setCookieHeader(SESSION_COOKIE_NAME, encodeCookie(session), 3600);
  const request = new Request("http://localhost/api/auth/session", { headers: { cookie } });

  expect(safeSessionSummary(request)).toMatchObject({
    isAuthenticated: true,
    subjectId: "user-1",
    subjectType: "user",
    permissionSummary: {
      total: 2,
      byResource: { "reference-data": ["create", "read"] }
    }
  });
});

test("reads named cookie value", () => {
  expect(readCookie("a=1; b=2", "b")).toBe("2");
});

test("auth bypass returns local session without a cookie", () => {
  process.env.AUTH_BYPASS = "true";
  process.env.APP_ENV = "local";
  const request = new Request("http://localhost/api/auth/session");

  expect(isAuthBypassEnabled()).toBe(true);
  expect(safeSessionSummary(request)).toMatchObject({
    isAuthenticated: true,
    subjectId: "local-user"
  });

  delete process.env.AUTH_BYPASS;
  delete process.env.APP_ENV;
});

test("local subject selection is allowlisted for live proof fixtures", () => {
  expect(localSubjectId("local.superuser")).toBe("local.superuser");
  expect(localSubjectId("local.reference.admin")).toBe("local.reference.admin");
  expect(localSubjectId("local.booking.user")).toBe("local.booking.user");
  expect(localSubjectId("attacker")).toBe("local.booking.user");
});

test("creates a standards-compliant PKCE transaction", () => {
  const transaction = createOidcTransaction("/booking");

  expect(transaction.pkceVerifier.length).toBeGreaterThanOrEqual(43);
  expect(createPkceChallenge(transaction.pkceVerifier)).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(transaction.returnUrl).toBe("/bookings");
});

test("creates a session from verified Keycloak claims", () => {
  const session = createOidcSession({
    sub: "local.booking.user",
    sid: "keycloak-session-1",
    preferred_username: "booking.user",
    email: "booking.user@example.test",
    realm_access: { roles: ["booking-desk", "default-roles-linercore-local"] },
    iat: 1_700_000_000,
    exp: 1_700_003_600
  });

  expect(session).toMatchObject({
    sessionId: "keycloak-session-1",
    subjectId: "local.booking.user",
    displayName: "booking.user",
    roles: ["booking-desk"],
    permissions: ["booking:read", "booking:create"],
    policyVersion: "keycloak:linercore-local"
  });
});

test("maps the pricing role to Charge module and command capabilities", () => {
  const session = createOidcSession({
    sub: "local.pricing.analyst",
    preferred_username: "pricing.user",
    realm_access: { roles: ["pricing"] }
  });

  expect(session.permissions).toEqual(expect.arrayContaining([
    "charge-agreement:read",
    "charge-agreements:read",
    "charge-agreements:approve",
    "charge-rates:read",
    "charge-rates:approve",
    "charge-manual-cases:read"
  ]));
});

test("maps the superuser role to every current application capability", () => {
  const session = createOidcSession({
    sub: "local.superuser",
    preferred_username: "superuser",
    realm_access: { roles: ["superuser"] }
  });

  expect(session.roles).toEqual(["superuser"]);
  expect(session.permissions).toEqual(expect.arrayContaining([
    "booking:reconfirm",
    "reference-data:reactivate",
    "charge-agreements:expire",
    "charge-rates:approve",
    "identity-roles:assign",
    "identity-audit:read",
    "platform-status:read"
  ]));
  expect(createLocalSession("local.superuser")).toMatchObject({
    roles: ["superuser"],
    permissions: expect.arrayContaining(["booking:read", "reference-data:read", "charge-agreement:read"])
  });
});

test("auth bypass is ignored outside local runtime profile", () => {
  process.env.AUTH_BYPASS = "true";
  process.env.APP_ENV = "staging";
  const request = new Request("http://localhost/api/auth/session");

  expect(isAuthBypassEnabled()).toBe(false);
  expect(safeSessionSummary(request)).toMatchObject({
    isAuthenticated: false
  });

  delete process.env.AUTH_BYPASS;
  delete process.env.APP_ENV;
});

test("auth config exposes local keycloak and service identity defaults", () => {
  expect(authConfig.keycloakRealm).toBe("linercore-local");
  expect(authConfig.keycloakIssuer).toContain("/realms/linercore-local");
  expect(authConfig.serviceIdentityClientId).toBe("linercore-identity-service");
});

test("public URLs honor the reverse proxy host", () => {
  const request = new Request("http://apps-auth:3000/api/auth/callback", {
    headers: { "x-forwarded-host": "127.0.0.1:8088", "x-forwarded-proto": "http" }
  });

  expect(publicUrl(request, "/booking").toString()).toBe("http://127.0.0.1:8088/booking");
});

test("sign-out redirects through Keycloak and clears the server session cookie", () => {
  const response = signOut(new Request("http://erp.local/auth/api/auth/sign-out", { method: "POST" }));

  expect(response.status).toBe(303);
  expect(response.headers.get("Location")).toBe("http://keycloak:8080/realms/linercore-local/protocol/openid-connect/logout?client_id=linercore-auth&post_logout_redirect_uri=http%3A%2F%2Ferp.local%2Fauth%2Fsigned-out");
  expect(response.headers.get("Set-Cookie")).toBe(`${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
});
